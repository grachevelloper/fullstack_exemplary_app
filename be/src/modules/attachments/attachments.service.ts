import {
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {STORAGE_PORT, StoragePort} from "../../shared/storage/storage.port";
import {AuthenticatedUser, Role} from "../../types";
import {Article} from "../articles/articles.entity";
import {Todo} from "../todos/todos.entity";
import {User} from "../users/users.entity";
import {AttachmentResponseDto, EntityAttachmentType} from "./attachments.dto";
import {Attachment} from "./attachments.entity";

function toAttachmentResponse(attachment: Attachment): AttachmentResponseDto {
    return {
        id: attachment.id,
        url: attachment.url,
        mimeType: attachment.mimeType,
        size: attachment.size,
        createdAt: attachment.createdAt,
    };
}

@Injectable()
export class AttachmentsService {
    constructor(
        @InjectRepository(Attachment)
        private attachmentsRepo: Repository<Attachment>,
        @InjectRepository(Todo)
        private todosRepo: Repository<Todo>,
        @InjectRepository(Article)
        private articlesRepo: Repository<Article>,
        @InjectRepository(User)
        private usersRepo: Repository<User>,
        @Inject(STORAGE_PORT)
        private storage: StoragePort,
    ) {}

    async attachImage(
        file: Express.Multer.File,
        entityType: EntityAttachmentType,
        entityId: string,
        actor: AuthenticatedUser,
    ): Promise<AttachmentResponseDto> {
        await this.assertCanAccessTarget(entityType, entityId, actor);

        return this.attachmentsRepo.manager.transaction(
            async (transactionalEntityManager) => {
                let s3Key: string | null = null;

                try {
                    const uploadResult = await this.storage.upload(file);
                    s3Key = uploadResult.key;

                    const attachment = this.attachmentsRepo.create({
                        url: uploadResult.url,
                        s3Key: uploadResult.key,
                        mimeType: uploadResult.mimeType,
                        size: uploadResult.size,
                        entityType,
                        entityId,
                    });

                    const savedAttachment =
                        await transactionalEntityManager.save(attachment);

                    return toAttachmentResponse(savedAttachment);
                } catch (error) {
                    if (s3Key) {
                        try {
                            await this.storage.delete(s3Key);
                        } catch (deleteError) {
                            console.error(
                                "Failed to delete uploaded attachment during compensation",
                                deleteError,
                            );
                        }
                    }

                    throw error;
                }
            },
        );
    }

    async getEntityImages(entityType: EntityAttachmentType, entityId: string) {
        return this.attachmentsRepo.find({
            where: {entityType, entityId},
        });
    }

    async deleteEntityFiles(
        entityType: EntityAttachmentType,
        entityId: string,
    ) {
        const attachments = await this.getEntityImages(entityType, entityId);

        try {
            await Promise.all(
                attachments.map((att) => this.storage.delete(att.s3Key)),
            );

            return {deleted: attachments.length};
        } catch (error) {
            console.error("Failed to delete entity images", {
                entityType,
                entityId,
                error,
                attachmentsCount: attachments.length,
            });

            throw error;
        }
    }

    async deleteAttachmentById(
        id: string,
        actor: AuthenticatedUser,
    ): Promise<void> {
        const attachment = await this.attachmentsRepo.findOneBy({id});

        if (!attachment) {
            throw new NotFoundException("Attachment not found");
        }

        await this.assertCanAccessTarget(
            attachment.entityType,
            attachment.entityId,
            actor,
        );

        await this.deleteAttachment(attachment);
    }

    async getArticleAttachment(
        id: string,
        articleId: string,
    ): Promise<Attachment> {
        const attachment = await this.attachmentsRepo.findOneBy({
            id,
            entityType: "article",
            entityId: articleId,
        });

        if (!attachment) {
            throw new NotFoundException("Article attachment not found");
        }

        return attachment;
    }

    async deleteAttachment(attachment: Attachment): Promise<void> {
        await this.storage.delete(attachment.s3Key);
        await this.attachmentsRepo.delete({id: attachment.id});
    }

    private async assertCanAccessTarget(
        entityType: EntityAttachmentType,
        entityId: string,
        actor: AuthenticatedUser,
    ): Promise<void> {
        const ownerId = await this.getTargetOwnerId(entityType, entityId);

        if (ownerId === actor.id || actor.role === Role.ADMIN) {
            return;
        }

        throw new ForbiddenException("You do not have access to this target");
    }

    private async getTargetOwnerId(
        entityType: EntityAttachmentType,
        entityId: string,
    ): Promise<string> {
        switch (entityType) {
            case "todo": {
                const todo = await this.todosRepo.findOne({
                    where: {id: entityId},
                });
                if (!todo) {
                    throw new NotFoundException("Todo not found");
                }
                return todo.authorId;
            }
            case "article": {
                const article = await this.articlesRepo.findOne({
                    where: {id: entityId},
                    relations: ["author"],
                });
                if (!article) {
                    throw new NotFoundException("Article not found");
                }
                return article.author.id;
            }
            case "user": {
                const user = await this.usersRepo.findOne({
                    where: {id: entityId},
                });
                if (!user) {
                    throw new NotFoundException("User not found");
                }
                return user.id;
            }
        }
    }
}
