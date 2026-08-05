import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {EntityManager, EntityTarget, Repository} from "typeorm";

import {AuthenticatedUser, Role} from "../../types";
import {Article} from "../articles/articles.entity";
import {Comment} from "../comments/comments.entity";
import {Todo} from "../todos/todos.entity";
import {EntityLikeType, Like} from "./likes.entity";

interface LikeTargetCommand {
    actor: AuthenticatedUser;
    entityId: string;
    entityType: EntityLikeType;
}

type HasLikedProps = {
    entityId: string;
    entityType: EntityLikeType;
    userId: string;
};

interface ArticleAccessData {
    authorId: string;
    isDraft: boolean;
}

interface CommentTargetData {
    entityId: string;
    entityType: "todo" | "article";
}

@Injectable()
export class LikesService {
    constructor(
        @InjectRepository(Like)
        private likesRepository: Repository<Like>,
    ) {}

    async hasLiked({
        entityId,
        entityType,
        userId,
    }: HasLikedProps): Promise<boolean> {
        return Boolean(
            await this.likesRepository.findOne({
                where: {
                    entityId,
                    entityType,
                    authorId: userId,
                },
            }),
        );
    }

    async create(command: LikeTargetCommand): Promise<Like> {
        try {
            return await this.likesRepository.manager.transaction(
                async (manager) => {
                    await this.assertCanAccessTarget(command, manager);

                    const existingLike = await manager.findOne(Like, {
                        where: {
                            entityId: command.entityId,
                            entityType: command.entityType,
                            authorId: command.actor.id,
                        },
                    });

                    if (existingLike) {
                        throw new ConflictException("Already liked");
                    }

                    const like = manager.create(Like, {
                        entityId: command.entityId,
                        entityType: command.entityType,
                        authorId: command.actor.id,
                    });
                    const savedLike = await manager.save(like);

                    await this.updateLikesCount({
                        manager,
                        entityId: command.entityId,
                        entityType: command.entityType,
                        delta: 1,
                    });

                    return savedLike;
                },
            );
        } catch (error) {
            if (this.isUniqueViolation(error)) {
                throw new ConflictException("Already liked");
            }

            throw error;
        }
    }

    async delete(command: LikeTargetCommand): Promise<void> {
        await this.likesRepository.manager.transaction(async (manager) => {
            await this.assertCanAccessTarget(command, manager);

            const result = await manager.delete(Like, {
                entityId: command.entityId,
                entityType: command.entityType,
                authorId: command.actor.id,
            });

            if (result.affected === 0) {
                throw new NotFoundException("Like not found");
            }

            await this.updateLikesCount({
                manager,
                entityId: command.entityId,
                entityType: command.entityType,
                delta: -1,
            });
        });
    }

    private async assertCanAccessTarget(
        {actor, entityId, entityType}: LikeTargetCommand,
        manager: EntityManager,
    ): Promise<void> {
        switch (entityType) {
            case "todo":
                await this.assertTodoExists(entityId, manager);
                return;
            case "article":
                await this.assertCanAccessArticle(entityId, actor, manager);
                return;
            case "comment":
                await this.assertCanAccessComment(entityId, actor, manager);
                return;
            default:
                throw new BadRequestException("Invalid entity type");
        }
    }

    private async assertTodoExists(
        todoId: string,
        manager: EntityManager,
    ): Promise<void> {
        const todo = await manager
            .createQueryBuilder()
            .select("todo.id", "id")
            .from("todos", "todo")
            .where("todo.id = :todoId", {todoId})
            .getRawOne<{id: string}>();

        if (!todo) {
            throw new NotFoundException("Todo not found");
        }

    }

    private async assertCanAccessArticle(
        articleId: string,
        actor: AuthenticatedUser,
        manager: EntityManager,
    ): Promise<void> {
        const article = await manager
            .createQueryBuilder()
            .select('article."authorId"', "authorId")
            .addSelect("article.is_draft", "isDraft")
            .from("articles", "article")
            .where("article.id = :articleId", {articleId})
            .getRawOne<ArticleAccessData>();

        if (!article) {
            throw new NotFoundException("Article not found");
        }

        const canAccessDraft =
            article.authorId === actor.id || actor.role === Role.ADMIN;
        if (article.isDraft && !canAccessDraft) {
            throw new ForbiddenException(
                "You do not have access to this article",
            );
        }
    }

    private async assertCanAccessComment(
        commentId: string,
        actor: AuthenticatedUser,
        manager: EntityManager,
    ): Promise<void> {
        const comment = await manager
            .createQueryBuilder()
            .select("comment.entity_type", "entityType")
            .addSelect("comment.entity_id", "entityId")
            .from("comments", "comment")
            .where("comment.id = :commentId", {commentId})
            .getRawOne<CommentTargetData>();

        if (!comment) {
            throw new NotFoundException("Comment not found");
        }

        await this.assertCanAccessTarget(
            {
                actor,
                entityType: comment.entityType,
                entityId: comment.entityId,
            },
            manager,
        );
    }

    private async updateLikesCount({
        manager,
        entityId,
        entityType,
        delta,
    }: {
        delta: 1 | -1;
        entityId: string;
        entityType: EntityLikeType;
        manager: EntityManager;
    }): Promise<void> {
        const target = this.getTargetEntity(entityType);
        const likesCountExpression =
            delta > 0 ? "likes_count + 1" : "GREATEST(likes_count - 1, 0)";

        const result = await manager
            .createQueryBuilder()
            .update(target)
            .set({likesCount: () => likesCountExpression})
            .where("id = :entityId", {entityId})
            .execute();

        if (result.affected === 0) {
            throw new NotFoundException(
                `${this.getTargetLabel(entityType)} not found`,
            );
        }
    }

    private getTargetEntity(entityType: EntityLikeType): EntityTarget<{
        likesCount: number;
    }> {
        switch (entityType) {
            case "todo":
                return Todo;
            case "article":
                return Article;
            case "comment":
                return Comment;
            default:
                throw new BadRequestException("Invalid entity type");
        }
    }

    private isUniqueViolation(error: unknown): boolean {
        return (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        );
    }

    private getTargetLabel(entityType: EntityLikeType): string {
        switch (entityType) {
            case "todo":
                return "Todo";
            case "article":
                return "Article";
            case "comment":
                return "Comment";
            default:
                throw new BadRequestException("Invalid entity type");
        }
    }
}
