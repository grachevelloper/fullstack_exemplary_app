import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {ConflictException, ForbiddenException, NotFoundException} from "@nestjs/common";
import {Test} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {CheckList} from "src/modules/todos/checklists/checklists.entity";
import {ChecklistService} from "src/modules/todos/checklists/checklists.service";
import {Todo} from "src/modules/todos/todos.entity";
import {AuthenticatedUser, Role} from "src/types";
import {Repository} from "typeorm";

describe("ChecklistService", () => {
    let service: ChecklistService;
    let checklistRepository: jest.Mocked<Repository<CheckList>>;
    let todosRepository: jest.Mocked<Repository<Todo>>;

    const owner = {id: "user-123", role: Role.USER} as AuthenticatedUser;
    const stranger = {id: "user-456", role: Role.USER} as AuthenticatedUser;
    const admin = {id: "admin-123", role: Role.ADMIN} as AuthenticatedUser;
    const todo = Object.assign(new Todo(), {
        id: "todo-123",
        title: "Todo",
        content: "Content",
        authorId: owner.id,
    });
    const checklist = Object.assign(new CheckList(), {
        id: "checklist-123",
        text: ["first", "second"],
        progress: 1,
        todoId: todo.id,
        todo,
    });

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                ChecklistService,
                {
                    provide: getRepositoryToken(CheckList),
                    useValue: {
                        create: jest.fn((value) => value),
                        save: jest.fn(async (value) => value),
                        findOne: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Todo),
                    useValue: {
                        findOne: jest
                            .fn<Repository<Todo>["findOne"]>()
                            .mockResolvedValue(todo),
                    },
                },
            ],
        }).compile();

        service = moduleRef.get(ChecklistService);
        checklistRepository = moduleRef.get(getRepositoryToken(CheckList));
        todosRepository = moduleRef.get(getRepositoryToken(Todo));
    });

    it("creates a checklist for the owner of the parent todo", async () => {
        checklistRepository.findOne.mockResolvedValue(null);

        await service.create({todoId: todo.id, initialText: ["first"], actor: owner});

        expect(todosRepository.findOne).toHaveBeenCalledWith({
            where: {id: todo.id},
        });
        expect(checklistRepository.create).toHaveBeenCalledWith({
            text: ["first"],
            progress: 0,
            todoId: todo.id,
        });
    });

    it("rejects creating a second checklist for the same todo", async () => {
        checklistRepository.findOne.mockResolvedValue(checklist);

        await expect(
            service.create({todoId: todo.id, initialText: [], actor: owner}),
        ).rejects.toBeInstanceOf(ConflictException);
        expect(checklistRepository.save).not.toHaveBeenCalled();
    });

    it("rejects checklist operations for another user's todo", async () => {
        await expect(
            service.addItem({todoId: todo.id, text: "third", actor: stranger}),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(checklistRepository.save).not.toHaveBeenCalled();
    });

    it("allows everyone to read a checklist", async () => {
        checklistRepository.findOne.mockResolvedValue(checklist);

        await expect(service.getByTodoId({todoId: todo.id})).resolves.toBe(
            checklist,
        );
    });

    it("allows an administrator to update another user's checklist", async () => {
        checklistRepository.findOne.mockResolvedValue(checklist);

        await service.addItem({todoId: todo.id, text: "third", actor: admin});

        expect(checklistRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({text: ["first", "second", "third"]}),
        );
    });

    it("throws not found when the parent todo does not exist", async () => {
        todosRepository.findOne.mockResolvedValue(null);

        await expect(
            service.getByTodoId({todoId: "missing"}),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("rejects out-of-range item indexes without saving", async () => {
        checklistRepository.findOne.mockResolvedValue(checklist);

        await expect(
            service.updateItemText({
                todoId: todo.id,
                itemIndex: 5,
                text: "updated",
                actor: owner,
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(checklistRepository.save).not.toHaveBeenCalled();
    });

    it("rejects negative item indexes without saving", async () => {
        checklistRepository.findOne.mockResolvedValue(checklist);

        await expect(
            service.removeItem({
                todoId: todo.id,
                itemIndex: -1,
                actor: owner,
            }),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(checklistRepository.save).not.toHaveBeenCalled();
    });

    it("keeps progress within checklist item bounds", async () => {
        checklistRepository.findOne.mockResolvedValue(
            Object.assign(new CheckList(), {
                ...checklist,
                text: ["first", "second"],
                progress: 1,
            }),
        );

        const afterOverflow = await service.updateProgress({
            todoId: todo.id,
            delta: 5,
            actor: owner,
        });

        expect(afterOverflow.progress).toBe(2);

        checklistRepository.findOne.mockResolvedValue(
            Object.assign(new CheckList(), {
                ...checklist,
                text: ["first", "second"],
                progress: 1,
            }),
        );

        const afterUnderflow = await service.updateProgress({
            todoId: todo.id,
            delta: -5,
            actor: owner,
        });

        expect(afterUnderflow.progress).toBe(0);
    });

    it("keeps progress in range when removing completed items", async () => {
        checklistRepository.findOne.mockResolvedValue(
            Object.assign(new CheckList(), {
                ...checklist,
                text: ["first", "second"],
                progress: 2,
            }),
        );

        const result = await service.removeItem({
            todoId: todo.id,
            itemIndex: 1,
            actor: owner,
        });

        expect(result.text).toEqual(["first"]);
        expect(result.progress).toBe(1);
    });
});
