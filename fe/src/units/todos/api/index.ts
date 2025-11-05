import {Todo} from '../types';
import {todoQuery} from './config';
import {type DtoUpdateTodo, type TodoApi} from './types';

const Api: TodoApi = {
    listTodos: async () => {
        const listTodos = await todoQuery.get<Todo[]>(`/listTodos`);

        return listTodos;
    },

    getTodoById: async (id: string) => {
        const todoData = await todoQuery.get<Todo>(`todos/${id}`);

        return todoData;
    },
    updateTodoById: async ({id, ...updateData}: DtoUpdateTodo) => {
        const response = await todoQuery.patch<Todo>(`todos/${id}`, updateData);
        return response;
    },
};

export default Api;
