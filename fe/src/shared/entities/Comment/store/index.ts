import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {PaginatedResponse} from '@/typings/common';

import api from '../api';
import {CreateCommentDto, ListComments, UpdateCommentDto} from '../api/types';
import {CommentType} from '../types';

export const useCommentsQuery = (listCommentsData: ListComments) => {
    const {data, isPending, isError} = useQuery({
        queryKey: [
            'comments',
            listCommentsData.entityType,
            listCommentsData.entityId,
        ],
        queryFn: () => api.listComments(listCommentsData),
        enabled: Boolean(listCommentsData.entityId),
    });

    return {comments: data?.items, isPending, isError};
};

export const useCreateCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation(
        {
            mutationFn: (createData: CreateCommentDto) =>
                api.createComment(createData),
            onSuccess: () => {
                queryClient.invalidateQueries({queryKey: ['comments']});
            },
        },
        queryClient
    );
};

const getCommentBranchIds = (
    comments: CommentType[],
    rootCommentId: string
): Set<string> => {
    const branchIds = new Set<string>([rootCommentId]);
    let hasNewBranchIds = true;

    while (hasNewBranchIds) {
        hasNewBranchIds = false;

        comments.forEach((comment) => {
            if (!comment.id || branchIds.has(comment.id)) {
                return;
            }

            if (comment.parentId && branchIds.has(comment.parentId)) {
                branchIds.add(comment.id);
                hasNewBranchIds = true;
            }
        });
    }

    return branchIds;
};

export const useCommentMutations = () => {
    const queryClient = useQueryClient();

    const updateMutation = useMutation(
        {
            mutationFn: (updateData: UpdateCommentDto) =>
                api.updateComment(updateData),
            onMutate: async (variables) => {
                await queryClient.cancelQueries({
                    queryKey: ['comment', variables.id],
                });

                const previousComment = queryClient.getQueryData<CommentType>([
                    'comment',
                    variables.id,
                ]);

                if (previousComment) {
                    queryClient.setQueryData(['comment', variables.id], {
                        ...previousComment,
                        ...variables,
                    });
                }

                return {previousComment};
            },
            onError: (err, variables, context) => {
                if (context?.previousComment) {
                    queryClient.setQueryData(
                        ['comment', variables.id],
                        context.previousComment
                    );
                }
            },
            onSettled: (_data, _error, variables) => {
                queryClient.invalidateQueries({
                    queryKey: ['comment', variables.id],
                });
                queryClient.invalidateQueries({queryKey: ['comments']});
            },
        },
        queryClient
    );

    const deleteMutation = useMutation(
        {
            mutationFn: (id: string) => api.deleteComment(id),
            onMutate: async (id) => {
                await queryClient.cancelQueries({queryKey: ['comments']});

                const previousLists =
                    queryClient.getQueriesData<PaginatedResponse<CommentType>>({
                        queryKey: ['comments'],
                    });

                queryClient.setQueriesData<PaginatedResponse<CommentType>>(
                    {queryKey: ['comments']},
                    (previous) => {
                        if (!previous) {
                            return previous;
                        }

                        const branchIds = getCommentBranchIds(
                            previous.items,
                            id
                        );

                        return {
                            ...previous,
                            total: Math.max(
                                previous.total - branchIds.size,
                                0
                            ),
                            items: previous.items.filter(
                                (comment) =>
                                    !comment.id || !branchIds.has(comment.id)
                            ),
                        };
                    }
                );

                return {previousLists};
            },
            onError: (_error, _id, context) => {
                context?.previousLists.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            },
            onSettled: () => {
                queryClient.invalidateQueries({queryKey: ['comments']});
            },
        },
        queryClient
    );

    return {
        updateMutation,
        deleteMutation,
    };
};
