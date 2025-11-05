import {observer} from 'mobx-react';
import {useCallback, useRef} from 'react';

import {State} from '@/todos/components/State';
import {useTodosStore} from '@/todos/hooks/useStore';
import {TodoState} from '@/todos/types';

interface TodoStateCellProps {
    state: TodoState;
    todoId: string;
}

const switchNewState = (state: TodoState): TodoState => {
    switch (state) {
        case TodoState.CANCELED:
            return TodoState.IN_WORK;
        case TodoState.PLANNING:
            return TodoState.IN_WORK;
        case TodoState.IN_WORK:
            return TodoState.FINISHED;
        case TodoState.FINISHED:
            return TodoState.IN_WORK;
    }
};

export const StateCell = observer(({state, todoId}: TodoStateCellProps) => {
    const store = useTodosStore();
    const {isPending} = store.getTodoById(todoId);
    const isEdited = useRef<boolean>(false);

    const stateRef = useRef<HTMLButtonElement>(null);

    const handleUpdateState = useCallback(() => {
        isEdited.current = true;
        store.updateTodoById({
            id: todoId,
            state: switchNewState(state),
        });
    }, [todoId, isEdited, store]);

    return (
        <State
            ref={stateRef}
            state={state}
            editable={{isEdited: isEdited.current}}
            onClick={handleUpdateState}
            isLoading={isPending}
        />
    );
});
