import { useTodosStore } from '../../entry';
import { TodosListPage } from './TodosListPage';
import { observer } from 'mobx-react';



export const TodosListPageWrapper = observer(() => {
    const store = useTodosStore();
    const { data: todos, isPending, isError } = store.listTodosQuery();

    if (isPending) return <div>Loading...</div>;
    if (isError) return <div>Error loading todos</div>;

    return <TodosListPage todos={todos || []} />;
});
