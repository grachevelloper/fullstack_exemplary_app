import {RouteProps} from 'react-router-dom';

import {TodoDetailsPage} from './TodoDetails';
import {TodosListPage} from './TodosList';

export const todosRoutes: RouteProps[] = [
    {
        path: '/todos',
        element: <TodosListPage />,
    },
    {
        path: '/:id',
        element: <TodoDetailsPage />,
    },
];
