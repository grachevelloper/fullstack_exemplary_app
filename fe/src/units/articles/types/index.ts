import {LikedEntity} from '@/typings/common';

import {User} from '../../users/types';

export interface Article extends LikedEntity {
    title: string;
    description: string;
    image: string;
    content: string;
    tags?: Tag[];
    likesCount: number;
    readTime?: number;
    author: User;
    isDraft: boolean;
}
export type UpdatableArticle = Omit<
    Article,
    'likesCount' | 'author' | 'hasLiked' | 'createdAt'
>;

export interface Tag {
    id: string;
    name: string;
}

export type UpdateDraftField = keyof Pick<
    Article,
    | 'content'
    | 'description'
    | 'readTime'
    | 'tags'
    | 'title'
    | 'image'
    | 'isDraft'
>;
