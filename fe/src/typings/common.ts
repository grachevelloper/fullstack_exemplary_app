export interface BaseEntity {
    createdAt?: Date;
    updatedAt?: Date;
    id: string;
}

export interface LikedEntity extends BaseEntity {
    hasLiked: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
}

export enum Role {
    ADMIN = 'Admin',
    WRITER = 'Writer',
    USER = 'User',
}
