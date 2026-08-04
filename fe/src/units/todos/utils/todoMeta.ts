import {TodoPriority, TodoState} from '../types';

export const DEFAULT_TODO_PRIORITY = TodoPriority.MEDIUM;
export const DEFAULT_TODO_STATE = TodoState.PLANNING;

const legacyPriorityByValue: Record<string, TodoPriority> = {
    Hight: TodoPriority.HIGH,
};

export const normalizeTodoPriority = (
    priority: Nullable<string>
): TodoPriority => {
    if (!priority) {
        return DEFAULT_TODO_PRIORITY;
    }

    if (Object.values(TodoPriority).includes(priority as TodoPriority)) {
        return priority as TodoPriority;
    }

    return legacyPriorityByValue[priority] ?? DEFAULT_TODO_PRIORITY;
};

export const getNextTodoPriority = (
    priority: Nullable<string>
): TodoPriority => {
    switch (normalizeTodoPriority(priority)) {
        case TodoPriority.LOW:
            return TodoPriority.MEDIUM;
        case TodoPriority.MEDIUM:
            return TodoPriority.HIGH;
        case TodoPriority.HIGH:
            return TodoPriority.SUPER;
        case TodoPriority.SUPER:
            return TodoPriority.LOW;
    }
};

export const normalizeTodoState = (
    state: Nullable<string>
): TodoState => {
    if (!state) {
        return DEFAULT_TODO_STATE;
    }

    if (Object.values(TodoState).includes(state as TodoState)) {
        return state as TodoState;
    }

    return DEFAULT_TODO_STATE;
};

export const priorityKeyByValue: Record<TodoPriority, string> = {
    [TodoPriority.LOW]: 'low',
    [TodoPriority.MEDIUM]: 'medium',
    [TodoPriority.HIGH]: 'high',
    [TodoPriority.SUPER]: 'super',
};

export const stateKeyByValue: Record<TodoState, string> = {
    [TodoState.IN_WORK]: 'in_work',
    [TodoState.PLANNING]: 'planning',
    [TodoState.FINISHED]: 'finished',
    [TodoState.CANCELED]: 'canceled',
};
