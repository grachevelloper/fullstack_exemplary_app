import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {TodoState} from "../types/todo";
import {CreateTodoDto, UpdateTodoDto} from "./dto";
import {Todo} from "./todos.entity";

@Injectable()
export class TodosService {
    constructor(
        @InjectRepository(Todo)
        private todosRepository: Repository<Todo>,
    ) {}

    async create(createTodoDto: CreateTodoDto): Promise<Todo> {
        const todo = this.todosRepository.create(createTodoDto);
        return this.todosRepository.save(todo);
    }

    async delete(id: string): Promise<void> {
        const todo = await this.todosRepository.findOne({where: {id}});
        if (!todo) {
            throw new NotFoundException("Todo not found");
        }
        await this.todosRepository.delete(id);
    }

    async update(id: string, updatedTodo: UpdateTodoDto): Promise<Todo> {
        const todo = await this.todosRepository.findOne({where: {id}});
        if (!todo) {
            throw new NotFoundException("Todo not found");
        }

        Object.assign(todo, updatedTodo);
        return this.todosRepository.save(todo);
    }

    async findOne(id: string): Promise<Todo> {
        const todo = await this.todosRepository.findOne({where: {id}});
        if (!todo) {
            throw new NotFoundException("Todo not found");
        }
        return todo;
    }

    async findAll(authorId: string): Promise<Todo[]> {
        const todos = await this.todosRepository.find({where: {authorId}});
        return todos;
    }

    async findActive(authorId: string): Promise<Todo[]> {
        const todos = await this.todosRepository.find({
            where: {
                state: TodoState.IN_WORK,
                authorId,
            },
        });
        return todos;
    }
}
