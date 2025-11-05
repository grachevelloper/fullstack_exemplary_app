import {observer} from 'mobx-react';
import {useCallback, useRef} from 'react';

import {Priority} from '@/todos/components/Priority';
import {useTodosStore} from '@/todos/hooks/useStore';
import {TodoPriority} from '@/todos/types';

interface TodoStateCellProps {
    priority: TodoPriority;
    todoId: string;
}

const switchNewPriority = (priority: TodoPriority): TodoPriority => {
    switch (priority) {
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

export const PriorityCell = observer(
    ({priority, todoId}: TodoStateCellProps) => {
        const store = useTodosStore();
        const {isPending} = store.getTodoById(todoId);
        const isEdited = useRef<boolean>(false);

        const handleUpdatePriority = useCallback(() => {
            isEdited.current = true;
            store.updateTodoById({
                id: todoId,
                priority: switchNewPriority(priority),
            });
        }, [todoId, isEdited, store]);

        return (
            <Priority
                priority={priority}
                editable={{isEdited: isEdited.current}}
                onClick={handleUpdatePriority}
                isLoading={isPending}
            />
        );
    }
);
