import {TodoPriority, Todo, TodoState} from 'src/units/todos/types/todo';
import {useId} from 'react';

export const createMockTodo = (overrides: Partial<Todo>): Todo => {
    const id = useId();
    const userId = useId();
    return {
        id,
        createdAt: new Date(Date.now()),
        title: overrides.title || 'Самая важная задача',
        content: overrides.content || 'Сделать самое важное дело в жизни',
        authorId: overrides.authorId || userId,
        priority: overrides.priority || TodoPriority.MEDIUM,
        isActive: overrides.isActive || true,
        state: overrides.state || TodoState.IN_WORK,
        ...overrides,
    };
};
