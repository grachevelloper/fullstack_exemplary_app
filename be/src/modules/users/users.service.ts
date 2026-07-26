import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import {Repository} from "typeorm";

import {AggregateDeletionService} from "../../processes/aggregate-deletion/aggregate-deletion.service";
import {AuthenticatedUser, Role} from "../../types";
import {CreateUserDto, UpdateUserDto} from "./user.dto";
import {User} from "./users.entity";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private aggregateDeletionService: AggregateDeletionService,
    ) {}

    async findById(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({where: {id}});
        if (!user) {
            throw new NotFoundException("User not found!");
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", {email})
            .getOne();
    }

    async findByYandexId(yandexId: string): Promise<User | null> {
        return this.usersRepository.findOneBy({yandexId});
    }

    async findForActor(id: string, actor: AuthenticatedUser): Promise<User> {
        this.assertSelfOrAdmin(id, actor);
        return this.findById(id);
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const {email, password, role, username} = createUserDto;
        const emailExists = await this.usersRepository.findOneBy({email});
        if (emailExists) {
            throw new ConflictException("User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.usersRepository.create({
            email,
            username,
            password: hashedPassword,
            role,
        });
        return this.usersRepository.save(user);
    }

    async createFromYandex(data: {
        avatar: string | null;
        email: string;
        username: string;
        yandexId: string;
    }): Promise<User> {
        const emailExists = await this.usersRepository
            .createQueryBuilder("user")
            .where("LOWER(user.email) = LOWER(:email)", {email: data.email})
            .getOne();
        if (emailExists) {
            throw new ConflictException("User with this email already exists");
        }

        const user = this.usersRepository.create({
            ...data,
            password: null,
            role: Role.USER,
        });

        return this.usersRepository.save(user);
    }

    async delete(id: string, actor: AuthenticatedUser): Promise<void> {
        if (actor.role !== Role.ADMIN) {
            throw new ForbiddenException("Administrator access required");
        }
        await this.findById(id);
        await this.aggregateDeletionService.deleteUserAggregate(id);
    }

    async update(
        id: string,
        updateData: UpdateUserDto,
        actor: AuthenticatedUser,
    ): Promise<User> {
        this.assertSelfOrAdmin(id, actor);
        if (updateData.role !== undefined && actor.role !== Role.ADMIN) {
            throw new ForbiddenException("Only an administrator can change roles");
        }
        if (this.hasNowadaysUpdate(updateData) && actor.role !== Role.ADMIN) {
            throw new ForbiddenException(
                "Only an administrator can update nowadays fields",
            );
        }
        const user = await this.findById(id);

        Object.assign(user, updateData);

        return this.usersRepository.save(user);
    }

    async changePassword(
        id: string,
        currentPassword: string,
        newPassword: string,
        actor: AuthenticatedUser,
    ): Promise<void> {
        const isSelf = id === actor.id;
        const isAdmin = actor.role === Role.ADMIN;

        if (!isSelf && !isAdmin) {
            throw new ForbiddenException("Access to this user is forbidden");
        }

        const user = await this.findByIdWithPassword(id);

        if (
            isSelf &&
            (!user.password ||
                !(await bcrypt.compare(currentPassword, user.password)))
        ) {
            throw new UnauthorizedException("Invalid current password");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersRepository.update(id, {password: hashedPassword});
    }

    private async findByIdWithPassword(id: string): Promise<User> {
        const user = await this.usersRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.id = :id", {id})
            .getOne();

        if (!user) {
            throw new NotFoundException("User not found!");
        }

        return user;
    }

    private assertSelfOrAdmin(id: string, actor: AuthenticatedUser): void {
        if (id !== actor.id && actor.role !== Role.ADMIN) {
            throw new ForbiddenException("Access to this user is forbidden");
        }
    }

    private hasNowadaysUpdate(updateData: UpdateUserDto): boolean {
        return (
            updateData.nowBeingIn !== undefined ||
            updateData.nowListening !== undefined ||
            updateData.nowReading !== undefined ||
            updateData.nowWatch !== undefined
        );
    }
}
