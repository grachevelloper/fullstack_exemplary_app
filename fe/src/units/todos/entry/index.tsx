import {createContext, useState} from 'react';

import {TodosStore} from '../store';

export const TodosContext = createContext<TodosStore | null>(null);

export const TodosProvider: React.FC<{children: React.ReactNode}> = ({
    children,
}) => {
    const [store] = useState(() => new TodosStore());

    return (
        <TodosContext.Provider value={store}>{children}</TodosContext.Provider>
    );
};
