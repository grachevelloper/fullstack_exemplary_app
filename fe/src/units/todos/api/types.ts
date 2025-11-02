import {Todo} from '../types/todo';

export interface TodoApi {
    listTodos: () => Promise<Todo[]>;
    getTodoById: (todoId: string) => Promise<Nullable<Todo>>;
}
