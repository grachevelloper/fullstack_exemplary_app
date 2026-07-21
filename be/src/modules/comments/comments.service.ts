import {
    BadRequestException,
    ForbiddenException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";

import {PaginatedResponseDto} from "../../shared/dto/paginated-response.dto";
import {AuthenticatedUser, Order, Role} from "../../types";
import {ArticlesService} from "../articles/articles.service";
import {Like} from "../likes/likes.entity";
import {LikesService} from "../likes/likes.service";
import {TodosService} from "../todos/todos.service";
import {UsersService} from "../users/users.service";
import {CreateCommentDto, UpdateCommentDto} from "./comments.dto";
import {Comment, EntityCommentType} from "./comments.entity";

type CommentWithLikedState = Comment & {
    hasLiked?: boolean;
};

interface UpdateCommentCommand {
    actor: AuthenticatedUser;
    data: UpdateCommentDto;
    id: string;
}

interface DeleteCommentCommand {
    actor: AuthenticatedUser;
    id: string;
}

interface FindEntityCommentsCommand {
    actor: AuthenticatedUser;
    entityId: string;
    entityType: EntityCommentType;
    limit?: number;
    order?: Order;
    page?: number;
}

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
        private usersService: UsersService,
        @Inject(forwardRef(() => TodosService))
        private todosService: TodosService,
        private articlesService: ArticlesService,
        private likesService: LikesService,
    ) {}

    async create(
        actor: AuthenticatedUser,
        createCommentData: CreateCommentDto,
    ): Promise<Comment> {
        await this.assertCanReadTarget(
            createCommentData.entityType,
            createCommentData.entityId,
            actor,
        );

        const author = await this.usersService.findById(actor.id);

        let depth = 0;
        if (createCommentData.parentId) {
            const parentComment = await this.findOne(
                createCommentData.parentId,
            );
            if (
                parentComment.entityType !== createCommentData.entityType ||
                parentComment.entityId !== createCommentData.entityId
            ) {
                throw new BadRequestException(
                    "Parent comment must belong to the same target",
                );
            }
            depth = parentComment.depth + 1;
        }

        const comment = this.commentRepository.create({
            ...createCommentData,
            author,
            depth,
        });

        return await this.commentRepository.save(comment);
    }

    async update({id, actor, data}: UpdateCommentCommand): Promise<Comment> {
        const comment = await this.findOne(id);
        this.assertCanMutate(comment, actor);

        Object.assign(comment, data);
        return this.commentRepository.save(comment);
    }

    async delete({id, actor}: DeleteCommentCommand): Promise<void> {
        const comment = await this.findOne(id);
        this.assertCanMutate(comment, actor);

        const comments = await this.commentRepository.find({
            where: {
                entityType: comment.entityType,
                entityId: comment.entityId,
            },
        });
        const branchIds = this.getBranchIds(comments, comment.id);

        await this.commentRepository.manager.transaction(async (manager) => {
            await manager.delete(Like, {
                entityType: "comment",
                entityId: In(branchIds),
            });
            await manager.delete(Comment, {id: In(branchIds)});
        });
    }

    async findOne(id: string): Promise<Comment> {
        const comment = await this.commentRepository.findOne({
            where: {id},
            relations: ["author"],
        });
        if (!comment) {
            throw new NotFoundException("Comment not found");
        }
        return comment;
    }

    async findOneForActor(
        id: string,
        actor: AuthenticatedUser,
    ): Promise<CommentWithLikedState> {
        const comment = await this.findOne(id);

        return {
            ...comment,
            hasLiked: await this.likesService.hasLiked({
                entityId: comment.id,
                entityType: "comment",
                userId: actor.id,
            }),
        };
    }

    async findByEntity({
        actor,
        entityType,
        entityId,
        limit = 100,
        order = Order.ASC,
        page = 1,
    }: FindEntityCommentsCommand): Promise<
        PaginatedResponseDto<CommentWithLikedState>
    > {
        await this.assertCanReadTarget(entityType, entityId, actor);

        const [comments, total] = await this.commentRepository.findAndCount({
            where: {entityType, entityId},
            relations: ["author"],
            order: {
                createdAt: order,
                id: order,
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        const commentsWithLikedState = await Promise.all(
            comments.map(async (comment) => ({
                ...comment,
                hasLiked: await this.likesService.hasLiked({
                    entityId: comment.id,
                    entityType: "comment",
                    userId: actor.id,
                }),
            })),
        );

        return new PaginatedResponseDto<CommentWithLikedState>(
            commentsWithLikedState,
            page,
            limit,
            total,
        );
    }

    private async assertCanReadTarget(
        entityType: EntityCommentType,
        entityId: string,
        actor: AuthenticatedUser,
    ): Promise<void> {
        if (entityType === "todo") {
            await this.todosService.findOne({id: entityId, actor});
            return;
        }

        await this.articlesService.findOne({id: entityId, actor});
    }

    private assertCanMutate(comment: Comment, actor: AuthenticatedUser): void {
        if (comment.author.id === actor.id || actor.role === Role.ADMIN) {
            return;
        }

        throw new ForbiddenException("You do not have access to this comment");
    }

    private getBranchIds(comments: Comment[], rootId: string): string[] {
        const childIdsByParent = comments.reduce<Record<string, string[]>>(
            (acc, comment) => {
                if (!comment.parentId) {
                    return acc;
                }
                acc[comment.parentId] ??= [];
                acc[comment.parentId].push(comment.id);
                return acc;
            },
            {},
        );
        const branchIds = [rootId];

        for (let index = 0; index < branchIds.length; index += 1) {
            const childIds = childIdsByParent[branchIds[index]] ?? [];
            branchIds.push(...childIds);
        }

        return branchIds;
    }
}
