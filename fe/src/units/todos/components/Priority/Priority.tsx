import {DownOutlined} from '@ant-design/icons';
import {Button, Dropdown, type MenuProps} from 'antd';
import block from 'bem-cn-lite';
import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {TodoPriority} from '@/todos/types';
import {
    normalizeTodoPriority,
    priorityKeyByValue,
} from '@/todos/utils/todoMeta';

import './Priority.scss';

const b = block('priority');

const priorities = [
    TodoPriority.LOW,
    TodoPriority.MEDIUM,
    TodoPriority.HIGH,
    TodoPriority.SUPER,
];

interface PriorityProps {
    priority: Nullable<TodoPriority>;
    editable?: {isEdited: boolean};
    onUpdate?: (priority: TodoPriority) => void;
    isLoading?: boolean;
}

export const Priority = ({
    priority,
    onUpdate,
    editable,
    isLoading,
}: PriorityProps) => {
    const {t} = useTranslation('todo');
    const [isOpen, setIsOpen] = useState(false);
    const isEdited = Boolean(editable?.isEdited);
    const normalizedPriority = normalizeTodoPriority(priority);
    const priorityKey = priorityKeyByValue[normalizedPriority];
    const priorityItems = useMemo<MenuProps['items']>(
        () =>
            priorities
                .filter((nextPriority) => nextPriority !== normalizedPriority)
                .map((nextPriority) => ({
                    key: nextPriority,
                    label: t(
                        `todo.priority.${priorityKeyByValue[nextPriority]}`
                    ),
                })),
        [normalizedPriority, t]
    );
    const handleMenuClick: MenuProps['onClick'] = ({key}) => {
        setIsOpen(false);
        onUpdate?.(key as TodoPriority);
    };
    const handleButtonClick = () => {
        if (!onUpdate || isLoading) {
            return;
        }

        setIsOpen((currentValue) => !currentValue);
    };

    const button = (
        <Button
            className={b({
                'is-edited': isEdited,
                editable: Boolean(onUpdate),
                [priorityKey]: true,
            })}
            onClick={handleButtonClick}
            loading={isLoading}
            size='middle'
            type='text'
        >
            <span className={b('label')}>
                {t(`todo.priority.${priorityKey}`)}
            </span>
            {onUpdate ? <DownOutlined className={b('chevron')} /> : null}
        </Button>
    );

    if (!onUpdate) {
        return button;
    }

    return (
        <Dropdown
            menu={{items: priorityItems, onClick: handleMenuClick}}
            onOpenChange={setIsOpen}
            open={isOpen}
            trigger={[]}
            disabled={isLoading}
        >
            {button}
        </Dropdown>
    );
};
