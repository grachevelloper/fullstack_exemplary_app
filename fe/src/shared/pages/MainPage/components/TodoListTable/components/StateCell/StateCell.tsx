import {useCallback, useRef} from 'react';

import {State} from '@/todos/components/State';
import {useTodoMutations, useTodoQuery} from '@/todos/store';
import {TodoState} from '@/todos/types';

interface TodoStateCellProps {
    state: TodoState;
    todoId: string;
}

export const StateCell = ({state, todoId}: TodoStateCellProps) => {
    const isEdited = useRef<boolean>(false);
    const {updateState} = useTodoMutations();
    const {isPending} = useTodoQuery(todoId);

    const stateRef = useRef<HTMLButtonElement>(null);

    const handleUpdateState = useCallback((nextState: TodoState) => {
        isEdited.current = true;
        updateState(todoId, nextState);
    }, [todoId, updateState]);

    return (
        <State
            ref={stateRef}
            state={state}
            editable={{isEdited: isEdited.current}}
            onUpdate={handleUpdateState}
            isLoading={isPending}
        />
    );
};
