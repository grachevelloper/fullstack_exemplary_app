import {UseMutationResult, UseQueryResult} from '@tanstack/react-query';
import {makeAutoObservable} from 'mobx';

import api from '../api';
import {type DtoUpdateTodo} from '../api/types';
import {Todo} from '../types';

import {MobxMutation, MobxQuery, queryClient} from '@/shared/lib';

export interface ITodosStore {
    listTodosQuery: () => UseQueryResult<Todo[], Error>;
    getTodoById: (id: string) => UseQueryResult<Todo, Error>;
    updateTodoById: (
        updateData: DtoUpdateTodo
    ) => UseMutationResult<Todo, Error, DtoUpdateTodo, unknown>;
}

export class TodosStore implements ITodosStore {
    constructor() {
        makeAutoObservable(this);
    }

    private todosQuery = new MobxQuery(
        () => ({
            queryKey: ['todos'],
            queryFn: api.listTodos,
        }),
        queryClient
    );

    private todoMutations = new Map<
        string,
        MobxMutation<Todo, Error, DtoUpdateTodo, unknown>
    >();

    private getTodoMutation(id: string) {
        if (!this.todoMutations.has(id)) {
            const mutation = new MobxMutation<
                Todo,
                Error,
                DtoUpdateTodo,
                unknown
            >(
                () => ({
                    mutationFn: (variables: DtoUpdateTodo) =>
                        api.updateTodoById(variables),
                    onSuccess: (data) => {
                        queryClient.setQueryData(
                            ['todos'],
                            (old: Todo[] | undefined) =>
                                old?.map((todo) =>
                                    todo.id === data.id ? data : todo
                                ) || []
                        );
                        queryClient.setQueryData(['todos', data.id], data);
                    },
                }),
                queryClient
            );
            this.todoMutations.set(id, mutation);
        }
        return this.todoMutations.get(id)!;
    }

    listTodosQuery = () => {
        return this.todosQuery.result as UseQueryResult<Todo[], Error>;
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

    updateTodoById = (updateData: DtoUpdateTodo) => {
        const mutation = this.getTodoMutation(updateData.id);
        mutation.result.mutateAsync(updateData);
        return mutation.result;
    };

    getUpdateTodoState = (id: string) => {
        return this.getTodoMutation(id).result;
    };
}
