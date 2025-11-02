export enum TodoPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

export enum TodoState {
    IN_WORK = 'inWork',
    PLANNING = 'planning',
    FINISHED = 'finished',
    CANCELED = 'canceled',
}

export interface Todo {
    id: string;
    title: string;
    content: string;
    authorId: string;
    isActive: boolean;
    priority: TodoPriority;
    state: TodoState;
    createdAt?: Date;
    updatedAt?: Date;
}
