import {DoubleLeftOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import block from 'bem-cn-lite';
import {useTranslation} from 'react-i18next';

import {TodoPriority} from '@/todos/types';

import './Priority.scss';

const b = block('priority');

interface PriorityProps {
    priority: TodoPriority;
    editable?: {isEdited: boolean};
    onClick?: () => void;
    isLoading: boolean;
}

const getCustomize = (priority: TodoPriority) => {
    switch (priority) {
        case TodoPriority.LOW:
            return {
                variant: 'filled',
                color: 'green',
            };
        case TodoPriority.MEDIUM:
            return {
                variant: 'filled',
                color: 'yellow',
            };
        case TodoPriority.HIGH:
            return {
                variant: 'solid',
                color: 'orange',
            };
        case TodoPriority.SUPER:
            return {
                variant: 'solid',
                color: 'red',
                icon: <DoubleLeftOutlined rotate={90} />,
            };
    }
};

export const Priority = ({
    priority,
    onClick,
    editable,
    isLoading,
}: PriorityProps) => {
    const {t} = useTranslation('todo');
    const isEdited = Boolean(editable?.isEdited);

    const customize = getCustomize(priority);
    return (
        <Button
            className={b({'is-edited': isEdited})}
            onClick={onClick}
            loading={isLoading}
            size='middle'
            {...customize}
        >
            {t(`todo.priority.${priority}`)}
        </Button>
    );
};
