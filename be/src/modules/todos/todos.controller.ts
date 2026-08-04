import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from "@nestjs/common";
import {Public} from "src/shared/decorators/auth.decorator";
import {CurrentUser} from "src/shared/decorators/current-user.decorator";
import {AuthenticatedUser} from "src/types";

import {CreateTodoDto, QueryTodosDto, ResponseGetTodos, UpdateTodoDto} from "./todo.dto";
import {TodosService} from "./todos.service";

@Controller("todos")
export class TodosController {
    constructor(private readonly todosService: TodosService) {}

    @Post()
    async create(
        @Body() createTodoData: CreateTodoDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return await this.todosService.create({
            data: createTodoData,
            actor: user,
        });
    }

    @Get()
    @Public()
    async findAll(
        @Query() query: QueryTodosDto,
    ): Promise<ResponseGetTodos> {
        return await this.todosService.findAll(query);
    }

    @Get(":id")
    @Public()
    async findOne(
        @Param("id", ParseUUIDPipe) id: string,
        @CurrentUser() user: AuthenticatedUser | undefined,
    ) {
        return this.todosService.findOne({id, actor: user});
    }

    @Patch(":id")
    async update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() updateTodo: UpdateTodoDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.todosService.update({id, data: updateTodo, actor: user});
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param("id", ParseUUIDPipe) id: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        await this.todosService.delete({id, actor: user});
    }
}
