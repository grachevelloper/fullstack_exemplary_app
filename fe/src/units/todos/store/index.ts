import {queryClient, MobxQuery} from '@/shared/lib';
import api from '../api';
import {makeAutoObservable} from 'mobx';

import {UseQueryResult} from '@tanstack/react-query';
import {Todo} from '../types/todo';

export interface ITodosStore {
    listTodosQuery: () => UseQueryResult<Todo[], Error>;
    getTodoById: (id: string) => UseQueryResult<Todo, Error>;
}

export class TodosStore implements ITodosStore {
    constructor() {
        makeAutoObservable(this);
    }

    listTodosQuery = () => {
        const query = new MobxQuery(
            () => ({
                queryKey: ['listTodos'],
                queryFn: api.listTodos,
            }),
            queryClient
        );
        return query.result as UseQueryResult<Todo[], Error>;
    };

    getTodoById = (id: string) => {
        const query = new MobxQuery(
            () => ({
                queryKey: ['todos', id],
                queryFn: () => api.getTodoById(id),
            }),
            queryClient
        );

        return query.result as UseQueryResult<Todo, Error>;
    };
}
