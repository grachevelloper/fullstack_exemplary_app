import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';

import {queryClient} from '@/shared/configs/api';

import api from '../api';
import {DtoCreateTodo, DtoUpdateTodo} from '../api/types';
import {Todo, TodoPriority, TodoState} from '../types';

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
                await queryClient.cancelQueries({
                    queryKey: ['todo', variables.id],
                });

                const previousTodo = queryClient.getQueryData<Todo>([
                    'todo',
                    variables.id,
                ]);

                if (previousTodo) {
                    queryClient.setQueryData(['todo', variables.id], {
                        ...previousTodo,
                        ...variables,
                    });
                }

                return {previousTodo};
            },
            onError: (err, variables, context) => {
                if (context?.previousTodo) {
                    queryClient.setQueryData(
                        ['todo', variables.id],
                        context.previousTodo
                    );
                }
            },
            onSuccess: (data, variables) => {
                queryClient.setQueryData<Todo>(
                    ['todo', variables.id],
                    (previous) => {
                        if (!previous) {
                            return data;
                        }

                        return {
                            ...previous,
                            ...data,
                        };
                    }
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
