import { TodoListTable } from './components/TodoListTable';
import { observer } from 'mobx-react';
import { Todo } from '../../types/todo';

interface TodosListPageProps {
    todos: Todo[];
}
export const TodosListPage = observer(({ todos }: TodosListPageProps) => {
    return (
        <div>
            <TodoListTable todos={todos} />
        </div>
    );
});
