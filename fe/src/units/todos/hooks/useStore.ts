import {useContext} from 'react';

import {TodosContext} from '../entry';

export const useTodosStore = () => {
    const store = useContext(TodosContext);
    if (!store)
        throw new Error('useTodosStore must be used within TodosProvider');
    return store;
};
