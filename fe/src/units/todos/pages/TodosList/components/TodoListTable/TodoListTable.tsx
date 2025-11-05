import {Table} from 'antd';
import {type ColumnsType} from 'antd/es/table';
import {observer} from 'mobx-react';
import {useTranslation} from 'react-i18next';

import {Todo, TodoPriority, TodoState} from '@/todos/types';

import {PriorityCell} from './components/PriorityCell';
import {StateCell} from './components/StateCell';

import './TodoListTable.scss';

interface TodoListTableProps {
    todos: Todo[];
}

type TodoTableColumns = Pick<
    Todo,
    'title' | 'createdAt' | 'updatedAt' | 'priority' | 'state' | 'id'
>;

export const TodoListTable = observer(({todos}: TodoListTableProps) => {
    const {t} = useTranslation('todo');

    const columns: ColumnsType<TodoTableColumns> = [
        {
            key: 'title',
            title: t('todo.table.col.todo'),
            dataIndex: 'title',
        },
        {
            key: 'priority',
            title: t('todo.table.col.priority'),
            dataIndex: 'priority',
            render: (priority: TodoPriority, record: TodoTableColumns) => {
                return <PriorityCell priority={priority} todoId={record.id} />;
            },
            shouldCellUpdate(record, prevRecord) {
                return record.priority !== prevRecord.priority;
            },
        },
        {
            key: 'state',
            title: t('todo.table.col.state'),
            dataIndex: 'state',
            render: (state: TodoState, record: TodoTableColumns) => (
                <StateCell state={state} todoId={record.id} />
            ),
            shouldCellUpdate(record, prevRecord) {
                return record.state !== prevRecord.state;
            },
        },
        {
            key: 'updatedAt',
            title: t('todo.table.col.updated-at'),
            dataIndex: 'updatedAt',
        },
        {
            key: 'createdAt',
            title: t('todo.table.col.created-at'),
            dataIndex: 'createdAt',
        },
    ];

    return <Table<TodoTableColumns> columns={columns} dataSource={todos} />;
});
