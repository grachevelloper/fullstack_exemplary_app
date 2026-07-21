import {query} from '@/shared/configs/api';

import {Article} from '../types';

import {
    ArticleApi,
    DtoCreateArticle,
    DtoUpdateArticle,
    DtoUpdateArticleContent,
    DtoUpdateArticleImage,
    DtoUpdateArticleReadTime,
    DtoUpdateArticleTags,
    DtoUpdateArticleTitle,
} from './types';

const api: ArticleApi = {
    create: async (createData: DtoCreateArticle): Promise<Article> => {
        const response = await query.post<Article>('articles', createData);
        return response;
    },

    update: async (updateData: DtoUpdateArticle): Promise<Article> => {
        const {id, ...data} = updateData;
        const response = await query.patch<Article>(`articles/${id}`, data);
        return response;
    },

    updateTitle: async (data: DtoUpdateArticleTitle): Promise<Article> => {
        const {id, title} = data;
        const response = await query.patch<Article>(`articles/${id}`, {
            title,
        });
        return response;
    },

    updateContent: async (data: DtoUpdateArticleContent): Promise<Article> => {
        const {id, content} = data;
        const response = await query.patch<Article>(`articles/${id}`, {
            content,
        });
        return response;
    },

    updateImage: async (data: DtoUpdateArticleImage): Promise<Article> => {
        const {id, image} = data;
        const response = await query.patch<Article>(`articles/${id}`, {
            image,
        });
        return response;
    },

    updateReadTime: async (
        data: DtoUpdateArticleReadTime
    ): Promise<Article> => {
        const {id, readTime} = data;
        const response = await query.patch<Article>(`articles/${id}`, {
            readTime,
        });
        return response;
    },

    updateTags: async (data: DtoUpdateArticleTags): Promise<Article> => {
        const {id, tags} = data;
        const response = await query.patch<Article>(`articles/${id}`, {
            tags,
        });
        return response;
    },

    delete: async (id: string): Promise<void> => {
        return await query.delete(`articles/${id}`);
    },

    getById: async (id: string): Promise<Article> => {
        const response = await query.get<Article>(`articles/${id}`, {
            skipAuthRedirect: true,
        });
        return response;
    },

    getDrafts: async (): Promise<Article[]> => {
        const response = await query.get<Article[]>(`articles/drafts`);
        return response;
    },

    getByAuthorId: async (authorId: string): Promise<Article[]> => {
        const response = await query.get<Article[]>(
            `articles/author/${authorId}`,
            {skipAuthRedirect: true}
        );
        return response;
    },

    getAll: async (search?: string) => {
        const response = await query.get('articles', {
            params: search ? {search} : undefined,
            skipAuthRedirect: true,
        });
        return response;
    },

    publish: async (id: string): Promise<Article> => {
        return await query.post<Article>(`articles/${id}/publish`);
    },
};

export default api;
