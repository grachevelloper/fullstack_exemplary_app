import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {ArticlesService} from "src/modules/articles/articles.service";
import {Comment} from "src/modules/comments/comments.entity";
import {CommentsService} from "src/modules/comments/comments.service";
import {Like} from "src/modules/likes/likes.entity";
import {LikesService} from "src/modules/likes/likes.service";
import {TodosService} from "src/modules/todos/todos.service";
import {UsersService} from "src/modules/users/users.service";
import {AuthenticatedUser, Role} from "src/types";
import {DeleteResult, EntityManager, Repository} from "typeorm";

describe("CommentsService", () => {
    let service: CommentsService;
    let repository: jest.Mocked<Repository<Comment>>;
    let usersService: jest.Mocked<UsersService>;
    let todosService: jest.Mocked<TodosService>;
    let articlesService: jest.Mocked<ArticlesService>;
    let likesService: jest.Mocked<LikesService>;

    const entityManager = {
        delete: jest.fn<EntityManager["delete"]>(),
    };

    const owner = {
        id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
        role: Role.USER,
    } as AuthenticatedUser;
    const stranger = {
        id: "ddb9a455-441a-4e87-844a-e25629b9fe32",
        role: Role.USER,
    } as AuthenticatedUser;
    const admin = {
        id: "b1ace43e-cfb0-4b51-8657-02f092409ef7",
        role: Role.ADMIN,
    } as AuthenticatedUser;

    const author = {
        id: owner.id,
        username: "writer",
        email: "writer@example.com",
        role: Role.USER,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
    };

    const targetId = "5ad1f01b-c3a7-401d-b040-8ef4c3d69f2f";
    const parent = Object.assign(new Comment(), {
        id: "766c13c0-6fa5-49fd-81f3-74e7a91a1645",
        content: "Parent",
        entityType: "todo" as const,
        entityId: targetId,
        parentId: null,
        depth: 0,
        likesCount: 0,
        author,
        createdAt: "2026-01-03T00:00:00.000Z",
        updatedAt: "2026-01-04T00:00:00.000Z",
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentsService,
                {
                    provide: getRepositoryToken(Comment),
                    useValue: {
                        create: jest.fn(),
                        createQueryBuilder: jest.fn(),
                        delete: jest.fn(),
                        find: jest.fn(),
                        findAndCount: jest.fn(),
                        findOne: jest.fn(),
                        manager: {
                            transaction: jest.fn(
                                async (
                                    callback: (
                                        manager: typeof entityManager,
                                    ) => Promise<unknown>,
                                ) => callback(entityManager),
                            ),
                        },
                        save: jest.fn(),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: TodosService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: ArticlesService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: LikesService,
                    useValue: {
                        hasLiked: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get(CommentsService);
        repository = module.get(getRepositoryToken(Comment));
        usersService = module.get(UsersService);
        todosService = module.get(TodosService);
        articlesService = module.get(ArticlesService);
        likesService = module.get(LikesService);
        entityManager.delete.mockReset();
    });

    it("creates a child comment only when parent belongs to the same target", async () => {
        usersService.findById.mockResolvedValue(author as never);
        todosService.findOne.mockResolvedValue({id: targetId} as never);
        repository.findOne.mockResolvedValue(parent);
        repository.create.mockReturnValue({...parent, id: "child", depth: 1});
        repository.save.mockResolvedValue({...parent, id: "child", depth: 1});

        await service.create(owner, {
            content: "Child",
            entityType: "todo",
            entityId: targetId,
            parentId: parent.id,
        });

        expect(todosService.findOne).toHaveBeenCalledWith({
            id: targetId,
            actor: owner,
        });
        expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                author,
                depth: 1,
                parentId: parent.id,
            }),
        );
    });

    it("rejects a parent comment from a different target", async () => {
        usersService.findById.mockResolvedValue(author as never);
        todosService.findOne.mockResolvedValue({id: targetId} as never);
        repository.findOne.mockResolvedValue({
            ...parent,
            entityId: "37a586bb-cf70-4ce8-b1ff-ae1a84b06826",
        });

        await expect(
            service.create(owner, {
                content: "Child",
                entityType: "todo",
                entityId: targetId,
                parentId: parent.id,
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(repository.save).not.toHaveBeenCalled();
    });

    it("checks article visibility before creating an article comment", async () => {
        usersService.findById.mockResolvedValue(author as never);
        articlesService.findOne.mockResolvedValue({id: targetId} as never);
        repository.create.mockReturnValue({...parent, entityType: "article"});
        repository.save.mockResolvedValue({...parent, entityType: "article"});

        await service.create(owner, {
            content: "Article comment",
            entityType: "article",
            entityId: targetId,
        });

        expect(articlesService.findOne).toHaveBeenCalledWith({
            id: targetId,
            actor: owner,
        });
    });

    it("forbids a regular user from updating another user's comment", async () => {
        repository.findOne.mockResolvedValue(parent);

        await expect(
            service.update({
                id: parent.id,
                actor: stranger,
                data: {content: "Updated"},
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(repository.save).not.toHaveBeenCalled();
    });

    it("allows an administrator to update another user's comment", async () => {
        repository.findOne.mockResolvedValue(parent);
        repository.save.mockResolvedValue({...parent, content: "Updated"});

        await service.update({
            id: parent.id,
            actor: admin,
            data: {content: "Updated"},
        });

        expect(repository.save).toHaveBeenCalledWith(
            expect.objectContaining({content: "Updated"}),
        );
    });

    it("deletes a comment branch and all likes for that branch", async () => {
        const child = {...parent, id: "child", parentId: parent.id};
        const grandchild = {...parent, id: "grandchild", parentId: child.id};
        repository.findOne.mockResolvedValue(parent);
        repository.find.mockResolvedValue([parent, child, grandchild]);
        entityManager.delete.mockResolvedValue({
            raw: [],
            affected: 3,
        } as DeleteResult);

        await service.delete({id: parent.id, actor: owner});

        expect(repository.manager.transaction).toHaveBeenCalled();
        expect(entityManager.delete).toHaveBeenNthCalledWith(1, Like, {
            entityType: "comment",
            entityId: expect.any(Object),
        });
        expect(entityManager.delete).toHaveBeenNthCalledWith(2, Comment, {
            id: expect.any(Object),
        });
    });

    it("forbids a regular user from deleting another user's comment", async () => {
        repository.findOne.mockResolvedValue(parent);

        await expect(
            service.delete({id: parent.id, actor: stranger}),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(repository.manager.transaction).not.toHaveBeenCalled();
    });

    it("sorts entity comments by creation time and id", async () => {
        repository.findAndCount.mockResolvedValue([[parent], 1]);
        likesService.hasLiked.mockResolvedValue(true);

        const result = await service.findByEntity({
            actor: owner,
            entityType: "todo",
            entityId: targetId,
            page: 2,
            limit: 10,
        });

        expect(todosService.findOne).toHaveBeenCalledWith({
            id: targetId,
            actor: owner,
        });
        expect(repository.findAndCount).toHaveBeenCalledWith({
            where: {entityType: "todo", entityId: targetId},
            relations: ["author"],
            order: {
                createdAt: "ASC",
                id: "ASC",
            },
            skip: 10,
            take: 10,
        });
        expect(likesService.hasLiked).toHaveBeenCalledWith({
            entityId: parent.id,
            entityType: "comment",
            userId: owner.id,
        });
        expect(result).toEqual({
            items: [expect.objectContaining({id: parent.id, hasLiked: true})],
            page: 2,
            limit: 10,
            total: 1,
            hasNext: false,
        });
    });

    it("adds liked state for a single comment response", async () => {
        repository.findOne.mockResolvedValue(parent);
        likesService.hasLiked.mockResolvedValue(true);

        const result = await service.findOneForActor(parent.id, owner);

        expect(repository.findOne).toHaveBeenCalledWith({
            where: {id: parent.id},
            relations: ["author"],
        });
        expect(likesService.hasLiked).toHaveBeenCalledWith({
            entityId: parent.id,
            entityType: "comment",
            userId: owner.id,
        });
        expect(result).toEqual(expect.objectContaining({hasLiked: true}));
    });

    it("throws not found when the comment is missing", async () => {
        repository.findOne.mockResolvedValue(null);

        await expect(service.findOne(parent.id)).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });
});
