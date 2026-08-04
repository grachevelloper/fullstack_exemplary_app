import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';

import {queryClient} from '@/shared/configs/api';
import {PaginatedResponse} from '@/typings/common';

import api from '../api';
import {Article, UpdatableArticle} from '../types';

import {articleKeys, fieldUpdateConfig} from './constants';

export const useGetAllArticles = (search?: string) => {
    return useQuery<PaginatedResponse<Article>, Error>({
        queryKey: articleKeys.list({search}),
        queryFn: () => api.getAll(search),
        retry: false,
    });
};

export const useGetArticleById = (id?: string) => {
    return useQuery<Article, Error>({
        queryKey: articleKeys.detail(id!),
        queryFn: () => {
            if (!id) {
                throw new Error('Article ID is required');
            }
            return api.getById(id);
        },
        enabled: !!id,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
};

export const useGetAuthorDrafts = (enabled = true) => {
    return useQuery<Article[], Error>({
        queryKey: articleKeys.drafts(),
        queryFn: () => api.getDrafts(),
        enabled,
    });
};

const useGetArticlesByAuthor = (authorId: string | undefined) => {
    return useQuery<Article[], Error>({
        queryKey: articleKeys.byAuthor(authorId || ''),
        queryFn: () => api.getByAuthorId(authorId!),
        enabled: !!authorId,
    });
};

export const useCreateArticle = () => {
    return useMutation<Article, Error, Parameters<typeof api.create>[0] | void>({
        mutationFn: (data) => api.create(data ?? undefined),
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: articleKeys.lists()});
            queryClient.setQueryData(articleKeys.detail(data.id), data);
        },
    });
};

export const useUpdateArticle = () => {
    const createMutation = <T extends keyof UpdatableArticle>(field: T) => {
        const mutation = useMutation({
            mutationFn: (
                variables: {id: string} & Record<T, UpdatableArticle[T]>
            ) => {
                const updateFunction = fieldUpdateConfig[field];

                if (!updateFunction) {
                    throw new Error(
                        `No update function configured for field: ${field}`
                    );
                }

                return updateFunction(variables);
            },
            onMutate: async (variables) => {
                await queryClient.cancelQueries({
                    queryKey: articleKeys.detail(variables.id),
                });
                const previous = queryClient.getQueryData<Article>(
                    articleKeys.detail(variables.id)
                );
                if (previous) {
                    queryClient.setQueryData(articleKeys.detail(variables.id), {
                        ...previous,
                        [field]: variables[field],
                    });
                }
                return {previous};
            },
            onError: (_err, variables, context) => {
                if (context?.previous) {
                    queryClient.setQueryData(
                        articleKeys.detail(variables.id),
                        context.previous
                    );
                }
            },
            onSuccess: (data, variables) => {
                queryClient.setQueryData(
                    articleKeys.detail(variables.id),
                    data
                );
                queryClient.invalidateQueries({queryKey: articleKeys.lists()});
                queryClient.invalidateQueries({queryKey: articleKeys.drafts()});
            },
        });

        return {
            mutate: (id: string, value: Article[T]) =>
                mutation.mutate({id, [field]: value} as any),
            mutateAsync: (id: string, value: Article[T]) =>
                mutation.mutateAsync({id, [field]: value} as any),
            isPending: mutation.isPending,
            isError: mutation.isError,
            error: mutation.error,
        };
    };

    const updateTitle = createMutation('title');
    const updateDescription = createMutation('description');
    const updateContent = createMutation('content');
    const updateImage = createMutation('image');
    const updateCoverMutation = useMutation<
        Article,
        Error,
        {coverAttachmentId: string; id: string}
    >({
        mutationFn: api.updateCover,
        onSuccess: (data) => {
            queryClient.setQueryData(articleKeys.detail(data.id), data);
            queryClient.invalidateQueries({queryKey: articleKeys.lists()});
            queryClient.invalidateQueries({queryKey: articleKeys.drafts()});
        },
    });
    const updateReadTime = createMutation('readTime');
    const updateTags = createMutation('tags');
    const updateDraftStatus = createMutation('isDraft');

    return {
        updateTitle,
        updateDescription,
        updateContent,
        updateImage,
        updateCover: {
            mutateAsync: (id: string, coverAttachmentId: string) =>
                updateCoverMutation.mutateAsync({id, coverAttachmentId}),
            isPending: updateCoverMutation.isPending,
            error: updateCoverMutation.error,
        },
        updateReadTime,
        updateTags,
        updateDraftStatus,
    };
};

export const useDeleteArticle = () => {
    const syncDeletedArticleCaches = (id: string) => {
        queryClient.removeQueries({queryKey: articleKeys.detail(id)});
        queryClient.invalidateQueries({queryKey: articleKeys.lists()});
        queryClient.invalidateQueries({queryKey: articleKeys.drafts()});
        queryClient.invalidateQueries({queryKey: articleKeys.authors()});
    };

    return useMutation<void, Error, string>({
        mutationFn: (id) => api.delete(id),
        onSuccess: (_, id) => syncDeletedArticleCaches(id),
        onError: (error, id) => {
            if (
                axios.isAxiosError(error) &&
                error.response?.status === 404
            ) {
                syncDeletedArticleCaches(id);
            }
        },
    });
};

const usePublishArticle = () => {
    return useMutation<Article, Error, string>({
        mutationFn: (id) => api.publish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({queryKey: articleKeys.detail(id)});
            queryClient.invalidateQueries({queryKey: articleKeys.lists()});
        },
    });
};
