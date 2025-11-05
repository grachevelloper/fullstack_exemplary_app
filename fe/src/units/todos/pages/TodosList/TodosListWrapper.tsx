import {observer} from 'mobx-react';

import {TodosListPage} from './TodosListPage';
import {TodosProvider} from '../../entry';

export const TodosListPageWrapper = observer(() => {
    return (
        <TodosProvider>
            <TodosListPage />
        </TodosProvider>
    );
});
