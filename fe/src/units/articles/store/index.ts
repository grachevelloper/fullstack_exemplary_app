import {useMutation, useQuery} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';

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
    const {t} = useTranslation('article');

    const emptyArticle = {
        title: t('article.new.title'),
        content: t('article.new.content'),
    };
    return useMutation<Article, Error, void>({
        mutationFn: () => api.create(emptyArticle),
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
    const updateContent = createMutation('content');
    const updateImage = createMutation('image');
    const updateReadTime = createMutation('readTime');
    const updateTags = createMutation('tags');
    const updateDraftStatus = createMutation('isDraft');

    return {
        updateTitle,
        updateContent,
        updateImage,
        updateReadTime,
        updateTags,
        updateDraftStatus,
    };
};

const useDeleteArticle = () => {
    return useMutation<void, Error, string>({
        mutationFn: (id) => api.delete(id),
        onSuccess: (_, id) => {
            queryClient.removeQueries({queryKey: articleKeys.detail(id)});
            queryClient.invalidateQueries({queryKey: articleKeys.lists()});
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
