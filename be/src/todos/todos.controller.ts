import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import {Request} from "express";
import {AuthGuard} from "src/guards/auth.guard";

import type {CreateTodoDto, UpdateTodoDto} from "./dto";
import {TodosService} from "./todos.service";

@UseGuards(AuthGuard)
@Controller("todos")
export class TodosController {
    constructor(private readonly todosService: TodosService) {}

    @Post()
    async create(@Body() createTodo: CreateTodoDto) {
        return await this.todosService.create(createTodo);
    }

    @Get()
    async findAll(@Req() req: Request) {
        return await this.todosService.findAll(req.user!.id);
    }

    @Get(":id")
    async findOne(@Param("id") id: string) {
        return this.todosService.findOne(id);
    }
    @Patch(":id")
    async update(@Param("id") id: string, updateTodo: UpdateTodoDto) {
        return this.todosService.update(id, updateTodo);
    }
}
