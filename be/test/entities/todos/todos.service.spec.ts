import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {ForbiddenException, NotFoundException} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {CommentsService} from "src/modules/comments/comments.service";
import {LikesService} from "src/modules/likes/likes.service";
import {Todo} from "src/modules/todos/todos.entity";
import {TodosService} from "src/modules/todos/todos.service";
import {AggregateDeletionService} from "src/processes/aggregate-deletion/aggregate-deletion.service";
import {AuthenticatedUser, Role} from "src/types";
import {EntityManager, Repository} from "typeorm";

import {CreateTodoDto, UpdateTodoDto} from "@/todos/todo.dto";
import {TodoPriority, TodoState} from "@/types/todo";

describe("TodosService", () => {
    let service: TodosService;
    let repository: jest.Mocked<Repository<Todo>>;
    let commentsService: jest.Mocked<CommentsService>;
    let aggregateDeletionService: jest.Mocked<AggregateDeletionService>;
    let likesService: jest.Mocked<LikesService>;
    const entityManager = {
        delete: jest.fn<EntityManager["delete"]>(),
        find: jest.fn<EntityManager["find"]>(),
    };

    const mockTodo: Todo = {
        id: "1",
        title: "Test Todo",
        content: "Test Description",
        likesCount: 0,
        authorId: "user-123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const owner = {
        id: "user-123",
        role: Role.USER,
    } as AuthenticatedUser;
    const stranger = {
        id: "user-456",
        role: Role.USER,
    } as AuthenticatedUser;
    const admin = {
        id: "admin-123",
        role: Role.ADMIN,
    } as AuthenticatedUser;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TodosService,
                {
                    provide: getRepositoryToken(Todo),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        findAndCount: jest.fn(),
                        delete: jest.fn(),
                        createQueryBuilder: jest.fn(),
                        manager: {
                            transaction: jest.fn(
                                async (
                                    callback: (
                                        manager: typeof entityManager,
                                    ) => Promise<unknown>,
                                ) => callback(entityManager),
                            ),
                        },
                    },
                },
                {
                    provide: CommentsService,
                    useValue: {
                        findByEntity: jest.fn(),
                    },
                },
                {
                    provide: AggregateDeletionService,
                    useValue: {
                        deleteTodoAggregate: jest.fn(),
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

        service = module.get<TodosService>(TodosService);
        repository = module.get(getRepositoryToken(Todo));
        commentsService = module.get(CommentsService);
        aggregateDeletionService = module.get(AggregateDeletionService);
        likesService = module.get(LikesService);
        entityManager.delete.mockReset();
        entityManager.find.mockReset();
    });

    describe("create", () => {
        it("should create a todo and return a mapped response", async () => {
            const createTodoData: CreateTodoDto = {
                title: "New Todo",
                content: "Description",
            };
            const todoWithRelation = {
                ...mockTodo,
                checklist: {id: "checklist-1"},
            } as Todo;

            repository.create.mockReturnValue(mockTodo);
            repository.save.mockResolvedValue(todoWithRelation);

            const result = await service.create({data: createTodoData, actor: owner});

            expect(repository.create).toHaveBeenCalledWith({
                ...createTodoData,
                authorId: owner.id,
            });
            expect(repository.save).toHaveBeenCalledWith(mockTodo);
            expect(result).toEqual({
                id: mockTodo.id,
                title: mockTodo.title,
                content: mockTodo.content,
                authorId: mockTodo.authorId,
                priority: null,
                state: null,
                likesCount: 0,
                hasLiked: false,
                createdAt: mockTodo.createdAt,
                updatedAt: mockTodo.updatedAt,
            });
            expect(result).not.toHaveProperty("checklist");
        });
    });

    describe("findOne", () => {
        it("should find todo by id", async () => {
            repository.findOne.mockResolvedValue(mockTodo);

            await service.findOne({id: "1"});

            expect(repository.findOne).toHaveBeenCalledWith({
                where: {id: "1"},
            });
        });

        it("should allow an administrator to read another user's todo", async () => {
            repository.findOne.mockResolvedValue(mockTodo);
            likesService.hasLiked.mockResolvedValue(true);

            await expect(service.findOne({id: "1", actor: admin})).resolves.toEqual({
                id: mockTodo.id,
                title: mockTodo.title,
                content: mockTodo.content,
                authorId: mockTodo.authorId,
                priority: null,
                state: null,
                likesCount: 0,
                hasLiked: true,
                createdAt: mockTodo.createdAt,
                updatedAt: mockTodo.updatedAt,
            });
            expect(likesService.hasLiked).toHaveBeenCalledWith({
                entityId: "1",
                entityType: "todo",
                userId: admin.id,
            });
        });

        it("should allow regular users to read another user's todo", async () => {
            repository.findOne.mockResolvedValue(mockTodo);
            likesService.hasLiked.mockResolvedValue(false);

            await expect(
                service.findOne({id: "1", actor: stranger}),
            ).resolves.toMatchObject({id: mockTodo.id, hasLiked: false});
        });

        it("should throw NotFoundException if todo not found", async () => {
            repository.findOne.mockResolvedValue(null);

            await expect(
                service.findOne({id: "999", actor: owner}),
            ).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe("findAll", () => {
        it("should find all todos for public read", async () => {
            const todos = [mockTodo, {...mockTodo, id: "2"}];
            repository.findAndCount.mockResolvedValue([todos, 2]);

            const result = await service.findAll({
                page: 2,
                limit: 1,
            });

            expect(repository.findAndCount).toHaveBeenCalledWith({
                order: {createdAt: "DESC", id: "DESC"},
                skip: 1,
                take: 1,
            });
            expect(result).toEqual({
                items: todos.map((todo) => ({
                    id: todo.id,
                    title: todo.title,
                    content: todo.content,
                    authorId: todo.authorId,
                    priority: null,
                    state: null,
                    likesCount: 0,
                    hasLiked: false,
                    createdAt: todo.createdAt,
                    updatedAt: todo.updatedAt,
                })),
                page: 2,
                limit: 1,
                total: 2,
                hasNext: false,
            });
        });
    });

    describe("findActive", () => {
        it("should find in-progress todos by author", async () => {
            const activeTodos = [mockTodo];
            repository.find.mockResolvedValue(activeTodos);

            await service.findActive("user-123");

            expect(repository.find).toHaveBeenCalledWith({
                where: {
                    state: TodoState.IN_WORK,
                    authorId: "user-123",
                },
            });
        });
    });

    describe("update", () => {
        it("should update todo", async () => {
            const updateData: UpdateTodoDto = {title: "Updated Todo"};
            const updatedTodo = {...mockTodo, ...updateData};

            repository.findOne.mockResolvedValue(mockTodo);
            repository.save.mockResolvedValue(updatedTodo);

            const result = await service.update({id: "1", data: updateData, actor: owner});

            expect(repository.findOne).toHaveBeenCalledWith({where: {id: "1"}});
            expect(repository.save).toHaveBeenCalledWith({
                ...mockTodo,
                ...updateData,
            });
            expect(mockTodo.title).toBe("Test Todo");
            expect(result).toEqual({
                id: mockTodo.id,
                title: "Updated Todo",
                content: mockTodo.content,
                authorId: mockTodo.authorId,
                priority: null,
                state: null,
                likesCount: 0,
                hasLiked: false,
                createdAt: mockTodo.createdAt,
                updatedAt: mockTodo.updatedAt,
            });
        });

        it("should throw NotFoundException if todo not found", async () => {
            repository.findOne.mockResolvedValue(null);

            await expect(
                service.update({
                    id: "999",
                    data: {title: "Updated"},
                    actor: owner,
                }),
            ).rejects.toThrow(NotFoundException);
        });

        it("should forbid regular users from updating another user's todo", async () => {
            repository.findOne.mockResolvedValue(mockTodo);

            await expect(
                service.update({
                    id: "1",
                    data: {title: "Updated"},
                    actor: stranger,
                }),
            ).rejects.toBeInstanceOf(ForbiddenException);
            expect(repository.save).not.toHaveBeenCalled();
        });

        it("should allow an administrator to update another user's todo", async () => {
            const updateData: UpdateTodoDto = {title: "Admin Updated Todo"};
            repository.findOne.mockResolvedValue(mockTodo);
            repository.save.mockResolvedValue({...mockTodo, ...updateData});

            await service.update({id: "1", data: updateData, actor: admin});

            expect(repository.save).toHaveBeenCalledWith({
                ...mockTodo,
                ...updateData,
            });
        });

        it("should not overwrite existing fields with undefined values", async () => {
            const todoWithPriority = {
                ...mockTodo,
                priority: TodoPriority.HIGH,
                state: TodoState.PLANNING,
            };
            const updateData = {
                state: TodoState.IN_WORK,
                title: undefined,
                priority: undefined,
            } as UpdateTodoDto;

            repository.findOne.mockResolvedValue(todoWithPriority);
            repository.save.mockResolvedValue({
                ...todoWithPriority,
                state: TodoState.IN_WORK,
            });

            await service.update({id: "1", data: updateData, actor: owner});

            expect(repository.save).toHaveBeenCalledWith({
                ...todoWithPriority,
                state: TodoState.IN_WORK,
            });
        });
    });

    describe("delete", () => {
        it("should delete todo", async () => {
            repository.findOne.mockResolvedValue(mockTodo);
            aggregateDeletionService.deleteTodoAggregate.mockResolvedValue();

            await service.delete({id: "1", actor: owner});

            expect(repository.findOne).toHaveBeenCalledWith({where: {id: "1"}});
            expect(aggregateDeletionService.deleteTodoAggregate).toHaveBeenCalledWith("1");
        });

        it("should throw NotFoundException if todo not found", async () => {
            repository.findOne.mockResolvedValue(null);

            await expect(service.delete({id: "999", actor: owner})).rejects.toThrow(
                NotFoundException,
            );
        });

        it("should forbid regular users from deleting another user's todo", async () => {
            repository.findOne.mockResolvedValue(mockTodo);

            await expect(
                service.delete({id: "1", actor: stranger}),
            ).rejects.toBeInstanceOf(ForbiddenException);
            expect(aggregateDeletionService.deleteTodoAggregate).not.toHaveBeenCalled();
        });

        it("should propagate aggregate deletion errors", async () => {
            repository.findOne.mockResolvedValue(mockTodo);
            aggregateDeletionService.deleteTodoAggregate.mockRejectedValue(
                new Error("storage failed"),
            );

            await expect(
                service.delete({id: "1", actor: owner}),
            ).rejects.toThrow("storage failed");
        });
    });

    describe("findTodoWithComments", () => {
        it("should return todo with comments", async () => {
            const mockComments = [{id: "1", content: "Test comment"}];

            repository.findOne.mockResolvedValue(mockTodo);
            commentsService.findByEntity.mockResolvedValue({
                items: mockComments,
                page: 1,
                limit: 100,
                total: 1,
                hasNext: false,
            } as any);

            const result = await service.findTodoWithComments({
                todoId: "1",
                actor: owner,
            });

            expect(repository.findOne).toHaveBeenCalledWith({where: {id: "1"}});
            expect(commentsService.findByEntity).toHaveBeenCalledWith({
                actor: owner,
                entityType: "todo",
                entityId: "1",
            });
            expect(result).toEqual({
                id: mockTodo.id,
                title: mockTodo.title,
                content: mockTodo.content,
                authorId: mockTodo.authorId,
                priority: null,
                state: null,
                likesCount: 0,
                hasLiked: false,
                createdAt: mockTodo.createdAt,
                updatedAt: mockTodo.updatedAt,
                comments: mockComments,
            });
        });

        it("should throw NotFoundException if todo not found", async () => {
            repository.findOne.mockResolvedValue(null);

            await expect(
                service.findTodoWithComments({todoId: "999", actor: owner}),
            ).rejects.toBeInstanceOf(NotFoundException);
            expect(commentsService.findByEntity).not.toHaveBeenCalled();
        });
    });

});
