import {Todo} from '../types';

export type DtoUpdateTodo = Partial<
    Pick<Todo, 'content' | 'state' | 'priority' | 'title'>
> & {
    id: string;
};

export interface TodoApi {
    listTodos: () => Promise<Todo[]>;
    getTodoById: (todoId: string) => Promise<Nullable<Todo>>;
    updateTodoById: (updateData: DtoUpdateTodo) => Promise<Todo>;
}
