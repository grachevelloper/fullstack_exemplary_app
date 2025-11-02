import { createContext, useContext, useState } from 'react';
import { TodosStore } from '../store';

export const TodosContext = createContext<TodosStore | null>(null);

export const TodosProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [store] = useState(() => new TodosStore());

    return (
        <TodosContext.Provider value={store}>{children}</TodosContext.Provider>
    );
};
export const useTodosStore = () => {
    const store = useContext(TodosContext);
    if (!store)
        throw new Error('useTodosStore must be used within TodosProvider');
    return store;
};
