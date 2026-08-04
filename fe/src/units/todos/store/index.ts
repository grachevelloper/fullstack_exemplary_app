import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';

import {queryClient} from '@/shared/configs/api';
import type {PaginatedResponse} from '@/typings/common';

import api from '../api';
import {DtoCreateTodo, DtoUpdateTodo} from '../api/types';
import {Todo, TodoPriority, TodoState} from '../types';

const removeUndefinedFields = <T extends object>(data: T): Partial<T> =>
    Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
    ) as Partial<T>;

const mergeTodo = (todo: Todo, update: Partial<Todo>): Todo => ({
    ...todo,
    ...removeUndefinedFields(update),
});

const patchTodosList = (
    list: PaginatedResponse<Todo> | undefined,
    todoId: string,
    update: Partial<Todo>
): PaginatedResponse<Todo> | undefined => {
    if (!list) {
        return list;
    }

    return {
        ...list,
        items: list.items.map((todo) =>
            todo.id === todoId ? mergeTodo(todo, update) : todo
        ),
    };
};

export const useTodosQuery = () => {
    const {data} = useSuspenseQuery({
        queryKey: ['todos'],
        queryFn: api.listTodos,
    });

    return {data: data.items};
};

export const useTodoQuery = (todoId?: string) => {
    const {data, isPending, isError, isPlaceholderData} = useQuery(
        {
            queryKey: ['todo', todoId],
            queryFn: () => api.getTodoById(todoId!),
            enabled: Boolean(todoId),
            placeholderData: keepPreviousData,
            retry: false,
        },
        queryClient
    );

    return {todo: data, isPending, isError, isPlaceholderData};
};

export const useCreateTodoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation(
        {
            mutationFn: (createData: DtoCreateTodo) =>
                api.createTodo(createData),
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['todos'],
                });
            },
        },
        queryClient
    );
};

export const useTodoMutations = () => {
    const queryClient = useQueryClient();

    const baseMutation = useMutation(
        {
            mutationFn: (updateData: DtoUpdateTodo) =>
                api.updateTodoById(updateData),
            onMutate: async (variables) => {
                await Promise.all([
                    queryClient.cancelQueries({
                        queryKey: ['todo', variables.id],
                    }),
                    queryClient.cancelQueries({
                        queryKey: ['todos'],
                    }),
                ]);

                const previousTodo = queryClient.getQueryData<Todo>([
                    'todo',
                    variables.id,
                ]);
                const previousTodos =
                    queryClient.getQueryData<PaginatedResponse<Todo>>([
                        'todos',
                    ]);

                if (previousTodo) {
                    queryClient.setQueryData(
                        ['todo', variables.id],
                        mergeTodo(previousTodo, variables)
                    );
                }

                queryClient.setQueryData(
                    ['todos'],
                    patchTodosList(previousTodos, variables.id, variables)
                );

                return {previousTodo, previousTodos};
            },
            onError: (err, variables, context) => {
                if (context?.previousTodo) {
                    queryClient.setQueryData(
                        ['todo', variables.id],
                        context.previousTodo
                    );
                }
                if (context?.previousTodos) {
                    queryClient.setQueryData(['todos'], context.previousTodos);
                }
            },
            onSuccess: (data, variables) => {
                queryClient.setQueryData(
                    ['todo', variables.id],
                    (previousTodo: Todo | undefined) =>
                        previousTodo ? mergeTodo(previousTodo, data) : data
                );
                queryClient.setQueryData(
                    ['todos'],
                    (previousTodos: PaginatedResponse<Todo> | undefined) =>
                        patchTodosList(previousTodos, variables.id, data)
                );
            },
        },
        queryClient
    );

    const updateTitle = (id: string, title: string) => {
        return baseMutation.mutate({id, title});
    };

    const updatePriority = (id: string, priority: TodoPriority) => {
        return baseMutation.mutate({id, priority});
    };

    const updateState = (id: string, state: TodoState) => {
        return baseMutation.mutate({id, state});
    };

    const updateContent = (id: string, content: string) => {
        return baseMutation.mutate({id, content});
    };

    return {
        mutation: baseMutation,

        updateTitle,
        updatePriority,
        updateState,
        updateContent,

        isPending: baseMutation.isPending,
        isError: baseMutation.isError,
        error: baseMutation.error,
    };
};
