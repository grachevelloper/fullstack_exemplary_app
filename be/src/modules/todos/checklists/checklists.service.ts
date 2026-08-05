import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {AuthenticatedUser, Role} from "src/types";
import {Repository} from "typeorm";

import {Todo} from "../todos.entity";
import {CheckList} from "./checklists.entity";

interface AddChecklistItemCommand {
    actor: AuthenticatedUser;
    text: string;
    todoId: string;
}

interface CreateChecklistCommand {
    actor: AuthenticatedUser;
    initialText?: string[];
    todoId: string;
}

interface DeleteChecklistCommand {
    actor: AuthenticatedUser;
    todoId: string;
}

interface FindChecklistCommand {
    actor: AuthenticatedUser;
    todoId: string;
}

interface FindTodoForActorCommand {
    actor: AuthenticatedUser;
    todoId: string;
}

interface RemoveChecklistItemCommand {
    actor: AuthenticatedUser;
    itemIndex: number;
    todoId: string;
}

interface UpdateChecklistItemTextCommand {
    actor: AuthenticatedUser;
    itemIndex: number;
    text: string;
    todoId: string;
}

interface UpdateChecklistProgressCommand {
    actor: AuthenticatedUser;
    delta: number;
    todoId: string;
}

@Injectable()
export class ChecklistService {
    constructor(
        @InjectRepository(CheckList)
        private checklistRepo: Repository<CheckList>,
        @InjectRepository(Todo)
        private todosRepository: Repository<Todo>,
    ) {}

    private async getChecklistById(checklistId: string): Promise<CheckList> {
        const checklist = await this.checklistRepo.findOne({
            where: {id: checklistId},
        });

        if (!checklist) {
            throw new NotFoundException(
                `Checklist with ID ${checklistId} not found`,
            );
        }

        return checklist;
    }

    async create({
        todoId,
        initialText = [],
        actor,
    }: CreateChecklistCommand): Promise<CheckList> {
        await this.findTodoForActor({todoId, actor});
        const existingChecklist = await this.checklistRepo.findOne({
            where: {todoId},
        });

        if (existingChecklist) {
            throw new ConflictException(`Checklist for todo ${todoId} exists`);
        }

        const checklist = this.checklistRepo.create({
            text: initialText,
            progress: 0,
            todoId,
        });

        return await this.checklistRepo.save(checklist);
    }

    async addItem({
        todoId,
        text,
        actor,
    }: AddChecklistItemCommand): Promise<CheckList> {
        const checklist = await this.getChecklistByTodoId({todoId, actor});
        checklist.text.push(text);
        return await this.checklistRepo.save(checklist);
    }

    async updateProgress({
        todoId,
        delta,
        actor,
    }: UpdateChecklistProgressCommand): Promise<CheckList> {
        const checklist = await this.getChecklistByTodoId({todoId, actor});
        const newProgress = checklist.progress + delta;
        checklist.progress = Math.max(
            0,
            Math.min(newProgress, checklist.text.length),
        );
        return await this.checklistRepo.save(checklist);
    }

    async deleteChecklist({
        todoId,
        actor,
    }: DeleteChecklistCommand): Promise<void> {
        const checklist = await this.getChecklistByTodoId({todoId, actor});
        const result = await this.checklistRepo.delete(checklist.id);

        if (result.affected === 0) {
            throw new NotFoundException(
                `Checklist for todo ${todoId} not found`,
            );
        }
    }

    async updateItemText({
        todoId,
        itemIndex,
        text,
        actor,
    }: UpdateChecklistItemTextCommand): Promise<CheckList> {
        const checklist = await this.getChecklistByTodoId({todoId, actor});

        if (itemIndex < 0 || itemIndex >= checklist.text.length) {
            throw new NotFoundException(
                `Item with index ${itemIndex} not found`,
            );
        }

        checklist.text[itemIndex] = text;
        return await this.checklistRepo.save(checklist);
    }

    async removeItem({
        todoId,
        itemIndex,
        actor,
    }: RemoveChecklistItemCommand): Promise<CheckList> {
        const checklist = await this.getChecklistByTodoId({todoId, actor});

        if (itemIndex < 0 || itemIndex >= checklist.text.length) {
            throw new NotFoundException(
                `Item with index ${itemIndex} not found`,
            );
        }

        checklist.text.splice(itemIndex, 1);

        if (itemIndex < checklist.progress) {
            checklist.progress -= 1;
        }

        return await this.checklistRepo.save(checklist);
    }

    async getByTodoId({
        todoId,
    }: Pick<FindChecklistCommand, "todoId">): Promise<CheckList | null> {
        await this.findTodo(todoId);
        return await this.checklistRepo.findOne({
            where: {todoId},
        });
    }

    private async getChecklistByTodoId({
        todoId,
        actor,
    }: FindChecklistCommand): Promise<CheckList> {
        await this.findTodoForActor({todoId, actor});
        const checklist = await this.checklistRepo.findOne({where: {todoId}});
        if (!checklist) {
            throw new NotFoundException(
                `Checklist for todo ${todoId} not found`,
            );
        }
        return checklist;
    }

    private async findTodo(todoId: string): Promise<Todo> {
        const todo = await this.todosRepository.findOne({where: {id: todoId}});
        if (!todo) {
            throw new NotFoundException(`Todo with ID ${todoId} not found`);
        }

        return todo;
    }

    private async findTodoForActor({
        todoId,
        actor,
    }: FindTodoForActorCommand): Promise<Todo> {
        const todo = await this.findTodo(todoId);

        if (todo.authorId !== actor.id && actor.role !== Role.ADMIN) {
            throw new ForbiddenException("You do not have access to this todo");
        }

        return todo;
    }
}
