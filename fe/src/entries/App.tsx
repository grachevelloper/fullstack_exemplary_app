import {BrowserRouter, Route, Routes} from 'react-router-dom';

import {TodosListPageWrapper as TodosListPage} from '@/todos/pages/TodosList';

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path='/'
                    element={
                        <TodosListPage />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
export default AppRouter;
