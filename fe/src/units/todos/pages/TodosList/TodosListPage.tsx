import {observer} from 'mobx-react';

import {useTodosStore} from '@/todos/hooks/useStore';

import {TodoListTable} from './components/TodoListTable';

export const TodosListPage = observer(() => {
    const store = useTodosStore();
    const {data: todos, isPending, isError} = store.listTodosQuery();

    if (isPending) return <div>Loading...</div>;
    if (isError) return <div>Error loading todos</div>;
    return (
        <div>
            <TodoListTable todos={todos} />
        </div>
    );
});
