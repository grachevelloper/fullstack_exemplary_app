import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import {Repository} from "typeorm";

import {UpdateUserDto} from "./dto";
import {User} from "./users.entity";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async findById(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({where: {id}});
        if (!user) {
            throw new NotFoundException("User not found!");
        }
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.usersRepository.findOne({where: {email}});
        if (!user) {
            throw new NotFoundException("User not found!");
        }
        return user;
    }

    async create(email: string, password: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
        });
        return this.usersRepository.save(user);
    }

    async delete(id: string): Promise<void> {
        await this.findById(id);
        await this.usersRepository.delete(id);
    }

    async changePassword(id: string, updateData: UpdateUserDto): Promise<void> {
        await this.findById(id);
        const hashedPassword = await bcrypt.hash(updateData.password, 10);
        await this.usersRepository.update(id, {password: hashedPassword});
    }
}
