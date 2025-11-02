import {todoQuery} from './config';
import {type TodoApi} from './types';

const Api: TodoApi = {
    listTodos: async () => {
        try {
            const listTodos = await todoQuery.get(`/listTodos`);

            return listTodos;
        } catch (error) {
            throw error;
        }
    },

    getTodoById: async (todoId: string) => {
        try {
            const todoData = await todoQuery.get(`todos/${todoId}`);

            return todoData;
        } catch (error) {
            throw error;
        }
    },
};

export default Api;
