import {Typography} from 'antd';
import block from 'bem-cn-lite';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

import {Todo, TodoPriority, TodoState} from '@/todos/types';

import './TodoListTable.scss';

const b = block('todo-list-table');

interface TodoListTableProps {
    todos: Todo[];
}

const priorityKeyByValue: Record<TodoPriority, string> = {
    [TodoPriority.LOW]: 'low',
    [TodoPriority.MEDIUM]: 'medium',
    [TodoPriority.HIGH]: 'high',
    [TodoPriority.SUPER]: 'super',
};

export const TodoListTable = ({todos}: TodoListTableProps) => {
    const {t} = useTranslation('todo');
    const navigate = useNavigate();
    const completedTodosCount = todos.filter(
        (todo) => todo.state === TodoState.FINISHED
    ).length;
    const progressPercent = todos.length
        ? (completedTodosCount / todos.length) * 100
        : 0;

    const handleRowClick = (index: string) => {
        void navigate(`/todos/${index}`);
    };

    return (
        <section className={b()}>
            <div className={b('head')}>
                <Typography.Title level={3} className={b('title')}>
                    {t('todo.table.title')}
                </Typography.Title>
                <span className={b('counter')}>
                    {completedTodosCount}/{todos.length}
                </span>
            </div>
            <div className={b('progress')} aria-hidden='true'>
                <span
                    className={b('progress-value')}
                    style={{width: `${progressPercent}%`}}
                />
            </div>
            <div className={b('list')}>
                {todos.map((todo) => {
                    const isCompleted = todo.state === TodoState.FINISHED;
                    const priorityKey = priorityKeyByValue[todo.priority];

                    return (
                        <button
                            className={b('item', {completed: isCompleted})}
                            key={todo.id}
                            type='button'
                            data-marker='todo-card'
                            onClick={() => handleRowClick(todo.id)}
                        >
                            <span
                                className={b('checkbox', {
                                    checked: isCompleted,
                                })}
                                aria-hidden='true'
                            />
                            <span className={b('item-title')}>
                                {todo.title}
                            </span>
                            <span
                                className={b('priority', {
                                    [priorityKey]: true,
                                })}
                            >
                                {t(`todo.priority.${priorityKey}`)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};
