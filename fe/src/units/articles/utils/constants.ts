import {Article} from '../types';

export const EMPTY_ARTICLE_BASE: Omit<Article, 'author' | 'image' | 'title'> = {
    id: Math.random().toString(36),
    content: '',
    hasLiked: false,
    isDraft: true,
    likesCount: 0,
};

// Keeps a new draft visually empty while satisfying older API validators.
export const INITIAL_DRAFT_CONTENT = ' ';
