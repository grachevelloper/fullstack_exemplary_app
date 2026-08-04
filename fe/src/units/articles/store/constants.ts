import api from '../api';
import {UpdatableArticle} from '../types';

export const articleKeys = {
    all: ['articles'] as const,
    lists: () => [...articleKeys.all, 'list'] as const,
    list: (filters?: {search?: string}) => [...articleKeys.lists(), {filters}] as const,
    details: () => [...articleKeys.all, 'detail'] as const,
    detail: (id: string) => [...articleKeys.details(), id] as const,
    drafts: () => [...articleKeys.all, 'drafts'] as const,
    authors: () => [...articleKeys.all, 'author'] as const,
    byAuthor: (authorId: string) =>
        [...articleKeys.authors(), authorId] as const,
};

export const tagsKeys = {
    all: ['tags'] as const,
    lists: () => [...tagsKeys.all, 'list'] as const,
    list: () => [...tagsKeys.lists()] as const,
    details: () => [...tagsKeys.all, 'detail'] as const,
    detail: (id: string) => [...tagsKeys.details(), id] as const,
};

export const fieldUpdateConfig: Record<
    keyof UpdatableArticle,
    (data: any) => Promise<unknown>
> = {
    title: (data) => api.updateTitle(data),
    description: (data) => api.updateDescription(data),
    content: (data) => api.updateContent(data),
    image: (data) => api.updateImage(data),
    readTime: (data) => api.updateReadTime(data),
    tags: (data) => api.updateTags(data),
    isDraft: (data) => api.publish(data.id),
    id: (data) => api.update(data),
    updatedAt: (data) => api.update(data),
};
