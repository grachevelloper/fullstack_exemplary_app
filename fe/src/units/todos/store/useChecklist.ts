import {
    useMutation,
    UseMutationResult,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';

import {ChecklistApi, type ChecklistData} from '../api/checklist';

export const useChecklistQuery = (todoId: string) => {
    const {data, isPending, isError} = useSuspenseQuery({
        queryKey: ['checklist', todoId],
        queryFn: () => ChecklistApi.getChecklist(todoId),
    });

    return {data};
};

type MutationVariables =
    | {type: 'addItem'; payload: {text: string}}
    | {type: 'updateItemText'; payload: {index: number; text: string}}
    | {type: 'updateProgress'; payload: {delta: number}}
    | {type: 'removeItem'; payload: {index: number}}
    | {type: 'createChecklist'; payload?: never}
    | {type: 'deleteChecklist'; payload?: never};

interface MutationContext {
    previousChecklist?: ChecklistData;
}

export const useChecklistMutations = (todoId: string) => {
    const queryClient = useQueryClient();

    const baseMutation: UseMutationResult<
        ChecklistData | void,
        Error,
        MutationVariables,
        MutationContext
    > = useMutation<ChecklistData | void, Error, MutationVariables, MutationContext>({
        mutationFn: (variables: MutationVariables) => {
            switch (variables.type) {
                case 'addItem':
                    return ChecklistApi.addItem(todoId, variables.payload.text);
                case 'updateItemText':
                    return ChecklistApi.updateItemText(
                        todoId,
                        variables.payload.index,
                        variables.payload.text
                    );
                case 'updateProgress':
                    return ChecklistApi.updateProgress(
                        todoId,
                        variables.payload.delta
                    );
                case 'removeItem':
                    return ChecklistApi.removeItem(
                        todoId,
                        variables.payload.index
                    );
                case 'createChecklist':
                    return ChecklistApi.createChecklist(todoId);
                case 'deleteChecklist':
                    return ChecklistApi.deleteChecklist(todoId);
                default:
                    throw new Error('Unknown mutation type');
            }
        },
        onMutate: async (
            variables: MutationVariables
        ): Promise<MutationContext> => {
            await queryClient.cancelQueries({
                queryKey: ['checklist', todoId],
            });

            const previousChecklist = queryClient.getQueryData<ChecklistData>([
                'checklist',
                todoId,
            ]);

            if (previousChecklist) {
                let newChecklist: ChecklistData;

                switch (variables.type) {
                    case 'addItem':
                        newChecklist = {
                            ...previousChecklist,
                            text: [
                                ...previousChecklist.text,
                                variables.payload.text,
                            ],
                        };
                        break;
                    case 'updateItemText':
                        newChecklist = {
                            ...previousChecklist,
                            text: previousChecklist.text.map(
                                (itemText: string, index: number) =>
                                    index === variables.payload.index
                                        ? variables.payload.text
                                        : itemText
                            ),
                        };
                        break;
                    case 'removeItem':
                        newChecklist = {
                            ...previousChecklist,
                            text: previousChecklist.text.filter(
                                (_: string, index: number) =>
                                    index !== variables.payload.index
                            ),
                            progress:
                                variables.payload.index <
                                previousChecklist.progress
                                    ? Math.max(
                                          0,
                                          previousChecklist.progress - 1
                                      )
                                    : previousChecklist.progress,
                        };
                        break;
                    case 'updateProgress':
                        const newProgress =
                            previousChecklist.progress +
                            variables.payload.delta;
                        newChecklist = {
                            ...previousChecklist,
                            progress: Math.max(
                                0,
                                Math.min(
                                    newProgress,
                                    previousChecklist.text.length
                                )
                            ),
                        };
                        break;
                    default:
                        newChecklist = previousChecklist;
                }

                queryClient.setQueryData(['checklist', todoId], newChecklist);
            }

            return {previousChecklist};
        },
        onError: (
            err: Error,
            variables: MutationVariables,
            context: MutationContext | undefined
        ) => {
            if (context?.previousChecklist) {
                queryClient.setQueryData(
                    ['checklist', todoId],
                    context.previousChecklist
                );
            }
        },
        onSuccess: (data) => {
            if (data) {
                queryClient.setQueryData(['checklist', todoId], data);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ['checklist', todoId],
            });
        },
    });

    const addItem = (text: string) => {
        return baseMutation.mutateAsync({type: 'addItem', payload: {text}});
    };

    const updateItemText = (index: number, text: string) => {
        return baseMutation.mutateAsync({
            type: 'updateItemText',
            payload: {index, text},
        });
    };

    const updateProgress = (delta: number) => {
        return baseMutation.mutateAsync({
            type: 'updateProgress',
            payload: {delta},
        });
    };

    const removeItem = (index: number) => {
        return baseMutation.mutateAsync({type: 'removeItem', payload: {index}});
    };

    const createChecklist = () => {
        return baseMutation.mutateAsync({type: 'createChecklist'});
    };

    const deleteChecklist = () => {
        return baseMutation.mutateAsync({type: 'deleteChecklist'});
    };

    return {
        mutation: baseMutation,

        addItem,
        updateItemText,
        updateProgress,
        removeItem,
        createChecklist,
        deleteChecklist,

        isPending: baseMutation.isPending,
        isError: baseMutation.isError,
        error: baseMutation.error,
    };
};
