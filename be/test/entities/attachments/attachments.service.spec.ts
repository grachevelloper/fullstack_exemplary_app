import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {ForbiddenException, NotFoundException} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {Article} from "src/modules/articles/articles.entity";
import {Attachment} from "src/modules/attachments/attachments.entity";
import {AttachmentsService} from "src/modules/attachments/attachments.service";
import {Todo} from "src/modules/todos/todos.entity";
import {User} from "src/modules/users/users.entity";
import {STORAGE_PORT, StoragePort} from "src/shared/storage/storage.port";
import {Role} from "src/types";
import {Repository} from "typeorm";

describe("AttachmentsService", () => {
    let service: AttachmentsService;
    let repository: jest.Mocked<Repository<Attachment>>;
    let storage: jest.Mocked<StoragePort>;
    let todoRepository: jest.Mocked<Repository<Todo>>;
    let articleRepository: jest.Mocked<Repository<Article>>;
    let userRepository: jest.Mocked<Repository<User>>;

    const attachment = Object.assign(new Attachment(), {
        id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
        url: "https://cdn.example/image.png",
        s3Key: "private/image.png",
        mimeType: "image/png",
        size: 1024,
        entityType: "todo" as const,
        entityId: "a2b479e6-3cf8-464c-91ea-e2cf07bfe35f",
        createdAt: "2026-01-01T00:00:00.000Z",
    });
    const actor = {
        id: "ef99be99-722e-438c-a9b9-ec6f7fb06e9d",
        role: Role.USER,
        iat: 0,
        exp: 0,
    };
    const adminActor = {...actor, role: Role.ADMIN};
    const save = jest.fn<Repository<Attachment>["save"]>();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AttachmentsService,
                {
                    provide: getRepositoryToken(Attachment),
                    useValue: {
                        create: jest.fn(),
                        delete: jest.fn(),
                        findOneBy: jest.fn(),
                        manager: {
                            transaction: jest.fn(
                                async (
                                    callback: (manager: {
                                        save: typeof save;
                                    }) => unknown,
                                ) => callback({save}),
                            ),
                        },
                    },
                },
                {
                    provide: STORAGE_PORT,
                    useValue: {
                        delete: jest.fn(),
                        upload: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Todo),
                    useValue: {findOne: jest.fn()},
                },
                {
                    provide: getRepositoryToken(Article),
                    useValue: {findOne: jest.fn()},
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {findOne: jest.fn()},
                },
            ],
        }).compile();

        service = module.get(AttachmentsService);
        repository = module.get(getRepositoryToken(Attachment));
        storage = module.get(STORAGE_PORT);
        todoRepository = module.get(getRepositoryToken(Todo));
        articleRepository = module.get(getRepositoryToken(Article));
        userRepository = module.get(getRepositoryToken(User));
        save.mockResolvedValue(attachment);
    });

    it("uploads for an owned todo and returns a safe response with file metadata", async () => {
        repository.create.mockReturnValue(attachment);
        todoRepository.findOne.mockResolvedValue(
            Object.assign(new Todo(), {id: attachment.entityId, authorId: actor.id}),
        );
        storage.upload.mockResolvedValue({
            key: attachment.s3Key,
            size: 1024,
            url: attachment.url,
            mimeType: "image/png",
        });

        const response = await service.attachImage(
            {mimetype: "image/png", size: 1024} as Express.Multer.File,
            "todo",
            attachment.entityId,
            actor,
        );

        expect(todoRepository.findOne).toHaveBeenCalledWith({
            where: {id: attachment.entityId},
        });
        expect(repository.create).toHaveBeenCalledWith({
            url: attachment.url,
            s3Key: attachment.s3Key,
            mimeType: "image/png",
            size: 1024,
            entityType: "todo",
            entityId: attachment.entityId,
        });
        expect(response).toEqual({
            id: attachment.id,
            url: attachment.url,
            mimeType: "image/png",
            size: 1024,
            createdAt: attachment.createdAt,
        });
        expect(response).not.toHaveProperty("s3Key");
        expect(response).not.toHaveProperty("entityType");
        expect(response).not.toHaveProperty("entityId");
    });

    it("allows an administrator to upload for another user's article", async () => {
        repository.create.mockReturnValue({...attachment, entityType: "article"});
        articleRepository.findOne.mockResolvedValue({
            id: attachment.entityId,
            author: {id: actor.id},
        } as Article);
        storage.upload.mockResolvedValue({
            key: attachment.s3Key,
            size: 1024,
            url: attachment.url,
            mimeType: "image/png",
        });

        await service.attachImage(
            {mimetype: "image/png", size: 1024} as Express.Multer.File,
            "article",
            attachment.entityId,
            adminActor,
        );

        expect(storage.upload).toHaveBeenCalled();
    });

    it("rejects upload for another user's target before storage is called", async () => {
        todoRepository.findOne.mockResolvedValue(
            Object.assign(new Todo(), {
                id: attachment.entityId,
                authorId: "ac18562a-a72b-4eec-a8db-a931d9db8ffb",
            }),
        );

        await expect(
            service.attachImage(
                {mimetype: "image/png", size: 1024} as Express.Multer.File,
                "todo",
                attachment.entityId,
                actor,
            ),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(storage.upload).not.toHaveBeenCalled();
    });

    it("deletes uploaded storage object when metadata save fails", async () => {
        repository.create.mockReturnValue(attachment);
        todoRepository.findOne.mockResolvedValue(
            Object.assign(new Todo(), {id: attachment.entityId, authorId: actor.id}),
        );
        storage.upload.mockResolvedValue({
            key: attachment.s3Key,
            size: 1024,
            url: attachment.url,
            mimeType: "image/png",
        });
        save.mockRejectedValue(new Error("database unavailable"));

        await expect(
            service.attachImage(
                {mimetype: "image/png", size: 1024} as Express.Multer.File,
                "todo",
                attachment.entityId,
                actor,
            ),
        ).rejects.toThrow("database unavailable");
        expect(storage.delete).toHaveBeenCalledWith(attachment.s3Key);
    });

    it("deletes storage before deleting attachment metadata for the owner", async () => {
        repository.findOneBy.mockResolvedValue(attachment);
        todoRepository.findOne.mockResolvedValue(
            Object.assign(new Todo(), {id: attachment.entityId, authorId: actor.id}),
        );

        await service.deleteAttachmentById(attachment.id, actor);

        expect(storage.delete).toHaveBeenCalledWith(attachment.s3Key);
        expect(repository.delete).toHaveBeenCalledWith({id: attachment.id});
    });

    it("keeps metadata when storage delete fails", async () => {
        repository.findOneBy.mockResolvedValue(attachment);
        todoRepository.findOne.mockResolvedValue(
            Object.assign(new Todo(), {id: attachment.entityId, authorId: actor.id}),
        );
        storage.delete.mockRejectedValue(new Error("storage unavailable"));

        await expect(
            service.deleteAttachmentById(attachment.id, actor),
        ).rejects.toThrow("storage unavailable");
        expect(repository.delete).not.toHaveBeenCalled();
    });

    it("returns not found for missing attachment delete", async () => {
        repository.findOneBy.mockResolvedValue(null);

        await expect(
            service.deleteAttachmentById(attachment.id, actor),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(storage.delete).not.toHaveBeenCalled();
    });

    it("finds an attachment only when it belongs to the article", async () => {
        const articleAttachment = Object.assign(new Attachment(), {
            ...attachment,
            entityType: "article" as const,
        });
        repository.findOneBy.mockResolvedValue(articleAttachment);

        await expect(
            service.getArticleAttachment(attachment.id, attachment.entityId),
        ).resolves.toBe(articleAttachment);
        expect(repository.findOneBy).toHaveBeenCalledWith({
            id: attachment.id,
            entityType: "article",
            entityId: attachment.entityId,
        });
    });

    it("checks user targets by id", async () => {
        repository.create.mockReturnValue({...attachment, entityType: "user"});
        userRepository.findOne.mockResolvedValue({id: actor.id} as User);
        storage.upload.mockResolvedValue({
            key: attachment.s3Key,
            size: 1024,
            url: attachment.url,
            mimeType: "image/png",
        });

        await service.attachImage(
            {mimetype: "image/png", size: 1024} as Express.Multer.File,
            "user",
            actor.id,
            actor,
        );

        expect(userRepository.findOne).toHaveBeenCalledWith({
            where: {id: actor.id},
        });
    });
});
