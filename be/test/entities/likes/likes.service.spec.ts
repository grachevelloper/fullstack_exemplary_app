import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from "@nestjs/common";
import {Test} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {Article} from "src/modules/articles/articles.entity";
import {Comment} from "src/modules/comments/comments.entity";
import {Like} from "src/modules/likes/likes.entity";
import {LikesService} from "src/modules/likes/likes.service";
import {Todo} from "src/modules/todos/todos.entity";
import {AuthenticatedUser, Role} from "src/types";
import {EntityManager, Repository} from "typeorm";

describe("LikesService", () => {
    let service: LikesService;
    let repository: jest.Mocked<Repository<Like>>;

    const actor = {
        id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
        role: Role.USER,
    } as AuthenticatedUser;
    const admin = {
        id: "89c130b1-1c47-4a0c-8a1c-e79cc39282ad",
        role: Role.ADMIN,
    } as AuthenticatedUser;
    const entityId = "92c130b1-1c47-4a0c-8a1c-e79cc39282ad";
    const manager = {
        create: jest.fn<EntityManager["create"]>(),
        createQueryBuilder: jest.fn<EntityManager["createQueryBuilder"]>(),
        delete: jest.fn<EntityManager["delete"]>(),
        findOne: jest.fn<EntityManager["findOne"]>(),
        save: jest.fn<EntityManager["save"]>(),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                LikesService,
                {
                    provide: getRepositoryToken(Like),
                    useValue: {
                        findOne: jest.fn(),
                        manager: {
                            transaction: jest.fn(
                                async (
                                    callback: (
                                        transactionManager: typeof manager,
                                    ) => Promise<unknown>,
                                ) => callback(manager),
                            ),
                        },
                    },
                },
            ],
        }).compile();

        service = moduleRef.get(LikesService);
        repository = moduleRef.get(getRepositoryToken(Like));
        jest.clearAllMocks();
    });

    it("creates an article like and increments the counter in one transaction", async () => {
        const like = Object.assign(new Like(), {
            id: "like-id",
            authorId: actor.id,
            entityType: "article" as const,
            entityId,
        });
        const articleAccess = createSelectBuilder({
            authorId: "another-user",
            isDraft: false,
        });
        const updateCounter = createUpdateBuilder();
        manager.createQueryBuilder
            .mockReturnValueOnce(articleAccess as never)
            .mockReturnValueOnce(updateCounter as never);
        manager.findOne.mockResolvedValue(null);
        manager.create.mockReturnValue(like as never);
        manager.save.mockResolvedValue(like as never);

        await expect(
            service.create({actor, entityType: "article", entityId}),
        ).resolves.toBe(like);

        expect(repository.manager.transaction).toHaveBeenCalled();
        expect(manager.findOne).toHaveBeenCalledWith(Like, {
            where: {entityId, entityType: "article", authorId: actor.id},
        });
        expect(manager.create).toHaveBeenCalledWith(Like, {
            entityId,
            entityType: "article",
            authorId: actor.id,
        });
        expect(updateCounter.update).toHaveBeenCalledWith(Article);
        expect(updateCounter.set).toHaveBeenCalledWith({
            likesCount: expect.any(Function),
        });
    });

    it("rejects an existing like without changing the counter", async () => {
        manager.createQueryBuilder.mockReturnValueOnce(
            createSelectBuilder({authorId: actor.id}) as never,
        );
        manager.findOne.mockResolvedValue({id: "existing"} as never);

        await expect(
            service.create({actor, entityType: "todo", entityId}),
        ).rejects.toBeInstanceOf(ConflictException);

        expect(manager.save).not.toHaveBeenCalled();
        expect(manager.createQueryBuilder).toHaveBeenCalledTimes(1);
    });

    it("maps database unique violations to a conflict", async () => {
        manager.createQueryBuilder.mockReturnValueOnce(
            createSelectBuilder({authorId: actor.id}) as never,
        );
        manager.findOne.mockResolvedValue(null);
        manager.create.mockReturnValue({} as never);
        manager.save.mockRejectedValue({code: "23505"} as never);

        await expect(
            service.create({actor, entityType: "todo", entityId}),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    it("allows a signed-in user to like another user's todo", async () => {
        const updateCounter = createUpdateBuilder();
        manager.createQueryBuilder
            .mockReturnValueOnce(createSelectBuilder({id: entityId}) as never)
            .mockReturnValueOnce(updateCounter as never);
        manager.findOne.mockResolvedValue(null);
        manager.create.mockReturnValue({} as never);
        manager.save.mockResolvedValue({} as never);

        await service.create({actor, entityType: "todo", entityId});

        expect(updateCounter.update).toHaveBeenCalledWith(Todo);
    });

    it("allows an administrator to like another user's todo", async () => {
        const updateCounter = createUpdateBuilder();
        manager.createQueryBuilder
            .mockReturnValueOnce(
                createSelectBuilder({authorId: "another-user"}) as never,
            )
            .mockReturnValueOnce(updateCounter as never);
        manager.findOne.mockResolvedValue(null);
        manager.create.mockReturnValue({} as never);
        manager.save.mockResolvedValue({} as never);

        await service.create({actor: admin, entityType: "todo", entityId});

        expect(updateCounter.update).toHaveBeenCalledWith(Todo);
    });

    it("deletes a comment like after checking the parent target visibility", async () => {
        const updateCounter = createUpdateBuilder();
        manager.createQueryBuilder
            .mockReturnValueOnce(
                createSelectBuilder({
                    entityType: "article",
                    entityId: "article-id",
                }) as never,
            )
            .mockReturnValueOnce(
                createSelectBuilder({authorId: actor.id, isDraft: true}) as never,
            )
            .mockReturnValueOnce(updateCounter as never);
        manager.delete.mockResolvedValue({affected: 1, raw: []} as never);

        await service.delete({actor, entityType: "comment", entityId});

        expect(manager.delete).toHaveBeenCalledWith(Like, {
            entityId,
            entityType: "comment",
            authorId: actor.id,
        });
        expect(updateCounter.update).toHaveBeenCalledWith(Comment);
        const setArg = updateCounter.set.mock.calls[0]?.[0] as {
            likesCount: () => string;
        };
        expect(setArg.likesCount()).toBe("GREATEST(likes_count - 1, 0)");
    });

    it("does not decrement when the like does not exist", async () => {
        manager.createQueryBuilder.mockReturnValueOnce(
            createSelectBuilder({authorId: actor.id}) as never,
        );
        manager.delete.mockResolvedValue({affected: 0, raw: []} as never);

        await expect(
            service.delete({actor, entityType: "todo", entityId}),
        ).rejects.toBeInstanceOf(NotFoundException);

        expect(manager.createQueryBuilder).toHaveBeenCalledTimes(1);
    });

    it("reports a missing target before changing likes", async () => {
        manager.createQueryBuilder.mockReturnValueOnce(
            createSelectBuilder(null) as never,
        );

        await expect(
            service.create({actor, entityType: "article", entityId}),
        ).rejects.toBeInstanceOf(NotFoundException);

        expect(manager.findOne).not.toHaveBeenCalled();
        expect(manager.save).not.toHaveBeenCalled();
    });

    it("rolls back when the target counter cannot be updated", async () => {
        manager.createQueryBuilder
            .mockReturnValueOnce(
                createSelectBuilder({authorId: actor.id}) as never,
            )
            .mockReturnValueOnce(createUpdateBuilder(0) as never);
        manager.findOne.mockResolvedValue(null);
        manager.create.mockReturnValue({} as never);
        manager.save.mockResolvedValue({} as never);

        await expect(
            service.create({actor, entityType: "todo", entityId}),
        ).rejects.toBeInstanceOf(NotFoundException);

        expect(manager.save).toHaveBeenCalled();
    });

    it("rejects unsupported target types", async () => {
        await expect(
            service.create({
                actor,
                entityType: "user" as never,
                entityId,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);

        expect(manager.findOne).not.toHaveBeenCalled();
        expect(manager.save).not.toHaveBeenCalled();
    });
});

function createSelectBuilder(result: unknown) {
    return {
        addSelect: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(result as never),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
    };
}

function createUpdateBuilder(affected = 1) {
    return {
        execute: jest.fn().mockResolvedValue({affected, raw: []} as never),
        set: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
    };
}
