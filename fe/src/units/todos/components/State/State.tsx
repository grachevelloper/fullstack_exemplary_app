import './State.scss';

import {DownOutlined} from '@ant-design/icons';
import {Button, Dropdown, type MenuProps} from 'antd';
import block from 'bem-cn-lite';
import {forwardRef, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {TodoState} from '@/todos/types';
import {normalizeTodoState, stateKeyByValue} from '@/todos/utils/todoMeta';

// import fireAnimation from '../../../../../public/lotiie/fire.json';

const b = block('state');

interface StateProps {
    state: Nullable<TodoState | string>;
    editable?: false | {isEdited: boolean};
    onUpdate?: (state: TodoState) => void;
    isLoading?: boolean;
}

const stateTransitions: Record<TodoState, TodoState[]> = {
    [TodoState.PLANNING]: [TodoState.IN_WORK, TodoState.CANCELED],
    [TodoState.IN_WORK]: [
        TodoState.FINISHED,
        TodoState.CANCELED,
        TodoState.PLANNING,
    ],
    [TodoState.FINISHED]: [TodoState.IN_WORK],
    [TodoState.CANCELED]: [TodoState.PLANNING, TodoState.IN_WORK],
};

export const State = forwardRef<HTMLButtonElement, StateProps>(
    ({state, editable, onUpdate, isLoading}, ref) => {
        const {t} = useTranslation('todo');
        const [isOpen, setIsOpen] = useState(false);
        const normalizedState = normalizeTodoState(state);
        const stateKey = stateKeyByValue[normalizedState];
        const transitionItems = useMemo<MenuProps['items']>(
            () =>
                stateTransitions[normalizedState].map((nextState) => ({
                    key: nextState,
                    label: t(`todo.state.${stateKeyByValue[nextState]}`),
                })),
            [normalizedState, t]
        );
        const handleMenuClick: MenuProps['onClick'] = ({key}) => {
            setIsOpen(false);
            onUpdate?.(key as TodoState);
        };
        const handleButtonClick = () => {
            if (!onUpdate || isLoading) {
                return;
            }

            setIsOpen((currentValue) => !currentValue);
        };

        const isEdited = editable && editable?.isEdited;
        const button = (
            <Button
                className={b({
                    'is-edited': isEdited,
                    editable: Boolean(onUpdate),
                    [stateKey]: true,
                })}
                loading={isLoading}
                onClick={handleButtonClick}
                ref={ref}
                type='text'
            >
                <span className={b('label')}>
                    {t(`todo.state.${stateKey}`)}
                </span>
                {onUpdate ? <DownOutlined className={b('chevron')} /> : null}
            </Button>
        );

        if (!onUpdate) {
            return button;
        }

        return (
            <Dropdown
                menu={{items: transitionItems, onClick: handleMenuClick}}
                onOpenChange={setIsOpen}
                open={isOpen}
                trigger={[]}
                disabled={isLoading}
            >
                {button}
            </Dropdown>
        );
    }
);
