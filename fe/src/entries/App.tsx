import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TodosListPageWrapper } from '@/todos/pages/TodosList';
import { TodosProvider } from '@/todos/entry';

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={
                    <TodosProvider>
                        <TodosListPageWrapper />
                    </TodosProvider>
                } />
            </Routes>
        </BrowserRouter>
    )
}
export default AppRouter;