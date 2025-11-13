import {
    useMutation,
    useQuery,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';

import {queryClient} from '@/shared/configs/api';

import api from '../api';
import {DtoUpdateTodo} from '../api/types';

export const useTodosQuery = () => {
    const {data} = useSuspenseQuery({
        queryKey: ['todos'],
        queryFn: api.listTodos,
    });

    return {data};
};

export const useTodoQuery = (todoId: string) => {
    const {data, isPending, isError} = useQuery(
        {
            queryKey: ['todo', todoId],
            queryFn: () => api.getTodoById(todoId),
        },
        queryClient
    );

    return {todo: data, isPending, isError};
};

export const useTodoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation(
        {
            mutationFn: (updateData: DtoUpdateTodo) =>
                api.updateTodoById(updateData),
            onSuccess: (variables) => {
                queryClient.invalidateQueries({
                    queryKey: ['todos', variables.id],
                });
                queryClient.invalidateQueries({
                    queryKey: ['todo', variables.id],
                });
            },
        },
        queryClient
    );
};
