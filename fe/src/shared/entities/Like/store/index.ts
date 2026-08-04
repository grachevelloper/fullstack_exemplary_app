import {useMutation, useQueryClient} from '@tanstack/react-query';

import {PaginatedResponse} from '@/typings/common';

import api from '../api';
import {EntityLikeType, ToggleLikeData} from '../api/types';

interface LikedEntityCache {
    id: string;
    hasLiked: boolean;
    likesCount: number;
}

const detailKeyByEntityType = (
    entityType: EntityLikeType,
    entityId: string
) => {
    switch (entityType) {
        case 'article':
            return ['articles', 'detail', entityId] as const;
        case 'comment':
            return ['comment', entityId] as const;
        case 'todo':
            return ['todo', entityId] as const;
    }
};

const listsKeyByEntityType = (entityType: EntityLikeType) => {
    switch (entityType) {
        case 'article':
            return ['articles', 'list'] as const;
        case 'comment':
            return ['comments'] as const;
        case 'todo':
            return ['todos'] as const;
    }
};

const getOptimisticEntity = <T extends Partial<LikedEntityCache>>(
    entity: T | undefined,
    hasLiked: boolean
): T | undefined => {
    if (!entity) {
        return entity;
    }

    const currentLikesCount = entity.likesCount ?? 0;

    return {
        ...entity,
        hasLiked: !hasLiked,
        likesCount: hasLiked
            ? Math.max(currentLikesCount - 1, 0)
            : currentLikesCount + 1,
    };
};

const updateListsCache = (
    queryClient: ReturnType<typeof useQueryClient>,
    entityId: string,
    entityType: EntityLikeType,
    hasLiked: boolean
) => {
    queryClient.setQueriesData<PaginatedResponse<LikedEntityCache>>(
        {queryKey: listsKeyByEntityType(entityType)},
        (previous) => {
            if (!previous) {
                return previous;
            }

            return {
                ...previous,
                items: previous.items.map((comment) =>
                    comment.id === entityId
                        ? (getOptimisticEntity(comment, hasLiked) ?? comment)
                        : comment
                ),
            };
        }
    );
};

export const useToggleLikeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({entityId, entityType, hasLiked}: ToggleLikeData) =>
            hasLiked
                ? api.deleteLike(entityType, entityId)
                : api.createLike(entityType, entityId),
        onMutate: async (variables) => {
            const detailKey = detailKeyByEntityType(
                variables.entityType,
                variables.entityId
            );

            await queryClient.cancelQueries({queryKey: detailKey});
            await queryClient.cancelQueries({
                queryKey: listsKeyByEntityType(variables.entityType),
            });

            const previousDetail =
                queryClient.getQueryData<LikedEntityCache>(detailKey);
            const previousLists = queryClient.getQueriesData<
                PaginatedResponse<LikedEntityCache>
            >({
                queryKey: listsKeyByEntityType(variables.entityType),
            });

            queryClient.setQueryData(
                detailKey,
                getOptimisticEntity(previousDetail, variables.hasLiked)
            );

            updateListsCache(
                queryClient,
                variables.entityId,
                variables.entityType,
                variables.hasLiked
            );

            return {previousDetail, previousLists};
        },
        onError: (_error, variables, context) => {
            if (context?.previousDetail) {
                queryClient.setQueryData(
                    detailKeyByEntityType(
                        variables.entityType,
                        variables.entityId
                    ),
                    context.previousDetail
                );
            }

            context?.previousLists.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
            });

            queryClient.invalidateQueries({
                queryKey: listsKeyByEntityType(variables.entityType),
            });
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({
                queryKey: listsKeyByEntityType(variables.entityType),
            });
        },
    });
};
