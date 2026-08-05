import {
    ForbiddenException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {AuthenticatedUser, Role} from "src/types";
import {Repository} from "typeorm";

import {PaginatedResponseDto} from "@/shared/dto/paginated-response.dto";
import {TodoState} from "@/types/todo";

import {AggregateDeletionService} from "../../processes/aggregate-deletion/aggregate-deletion.service";
import {CommentsService} from "../comments/comments.service";
import {LikesService} from "../likes/likes.service";
import {
    CreateTodoDto,
    QueryTodosDto,
    ResponseGetTodos,
    TodoResponseDto,
    UpdateTodoDto,
} from "./todo.dto";
import {Todo} from "./todos.entity";
import {TodosMapper} from "./todos.mapper";

interface CreateTodoCommand {
    actor: AuthenticatedUser;
    data: CreateTodoDto;
}

interface DeleteTodoCommand {
    actor: AuthenticatedUser;
    id: string;
}

interface FindTodoCommand {
    actor?: AuthenticatedUser;
    id: string;
}

interface FindTodoWithCommentsCommand {
    actor: AuthenticatedUser;
    todoId: string;
}

interface UpdateTodoCommand {
    actor: AuthenticatedUser;
    data: UpdateTodoDto;
    id: string;
}

const removeUndefinedFields = <T extends object>(data: T): Partial<T> =>
    Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined),
    ) as Partial<T>;

@Injectable()
export class TodosService {
    constructor(
        @InjectRepository(Todo)
        private todosRepository: Repository<Todo>,
        @Inject(forwardRef(() => CommentsService))
        private commentsService: CommentsService,
        private aggregateDeletionService: AggregateDeletionService,
        private likesService: LikesService,
    ) {}

    async create({data, actor}: CreateTodoCommand): Promise<TodoResponseDto> {
        const todo = this.todosRepository.create({
            title: data.title,
            content: data.content,
            priority: data.priority,
            state: data.state,
            authorId: actor.id,
        });
        return TodosMapper.toResponse(await this.todosRepository.save(todo));
    }

    async delete({id, actor}: DeleteTodoCommand): Promise<void> {
        await this.findEntityForUpdate({id, actor});
        await this.aggregateDeletionService.deleteTodoAggregate(id);
    }

    async update({
        id,
        data,
        actor,
    }: UpdateTodoCommand): Promise<TodoResponseDto> {
        const todo = await this.findEntityForUpdate({id, actor});
        const updatedTodo = {...todo, ...removeUndefinedFields(data)};

        return TodosMapper.toResponse(
            await this.todosRepository.save(updatedTodo),
        );
    }

    async findOne({id, actor}: FindTodoCommand): Promise<TodoResponseDto> {
        const todo = await this.findEntity(id);

        const hasLiked = actor
            ? await this.likesService.hasLiked({
                  entityId: id,
                  entityType: "todo",
                  userId: actor.id,
              })
            : false;

        return TodosMapper.toResponse(todo, hasLiked);
    }

    async findAll(query: QueryTodosDto = {}): Promise<ResponseGetTodos> {
        const {page = 1, limit = 10} = query;
        const [todos, total] = await this.todosRepository.findAndCount({
            order: {createdAt: "DESC", id: "DESC"},
            skip: (page - 1) * limit,
            take: limit,
        });

        return new PaginatedResponseDto<TodoResponseDto>(
            todos.map((todo) => TodosMapper.toResponse(todo)),
            page,
            limit,
            total,
        );
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

    async findTodoWithComments({todoId, actor}: FindTodoWithCommentsCommand) {
        const todo = await this.findEntityForUpdate({id: todoId, actor});
        const comments = await this.commentsService.findByEntity({
            actor,
            entityType: "todo",
            entityId: todoId,
        });
        return {...TodosMapper.toResponse(todo), comments: comments.items};
    }

    private async findEntity(id: string): Promise<Todo> {
        const todo = await this.todosRepository.findOne({where: {id}});
        if (!todo) {
            throw new NotFoundException("Todo not found");
        }
        return todo;
    }

    private async findEntityForUpdate({
        id,
        actor,
    }: Required<FindTodoCommand>): Promise<Todo> {
        const todo = await this.findEntity(id);
        this.assertCanAccess(todo, actor);
        return todo;
    }

    private assertCanAccess(todo: Todo, actor: AuthenticatedUser): void {
        if (todo.authorId === actor.id || actor.role === Role.ADMIN) {
            return;
        }

        throw new ForbiddenException("You do not have access to this todo");
    }
}
