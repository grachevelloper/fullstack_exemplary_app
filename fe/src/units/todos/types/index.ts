export enum TodoPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    SUPER = 'super',
}

export enum TodoState {
    IN_WORK = 'in_work',
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

export type EditValue = 'state' | 'priority';
