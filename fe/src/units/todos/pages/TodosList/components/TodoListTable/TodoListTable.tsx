import { Table, TableColumnsType } from "antd"
import { Todo } from "src/units/todos/types/todo"
import { useTranslation } from "react-i18next"
import { ColumnsType } from "antd/es/table"
import { observable } from "mobx"
import { observer } from "mobx-react"

interface TodoListTableProps {
    todos: Todo[]
}

type TodoTableColumns = Pick<Todo, 'title' | 'createdAt' | 'updatedAt' | 'priority' | 'state'>


export const TodoListTable = observer(({ todos }: TodoListTableProps) => {
    const { t } = useTranslation("todo")

    const columns: ColumnsType<TodoTableColumns> = [
        {
            key: 'title',
            title: t("todo.table.col.todo"),
            dataIndex: 'title',
        },
        {
            key: 'state',
            title: t("todo.table.col.state"),
            dataIndex: 'state',
        },
        {
            key: 'updatedAt',
            title: t("todo.table.col.updated-at"),
            dataIndex: 'updatedAt',
        },

        {
            key: 'createdAt',
            title: t("todo.table.col.created-at"),
            dataIndex: 'createdAt',
        }
    ]

    return (
        <Table<TodoTableColumns> columns={columns} dataSource={todos} />
    )
})