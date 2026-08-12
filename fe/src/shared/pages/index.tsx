import {RouteProps} from 'react-router-dom';

import {AdminNowadaysPage} from './AdminNowadaysPage';
import {MainPage} from './MainPage';
import {NoPermissionPage} from './NoPermissionPage';
import {NotFoundPage} from './NotFoundPage';
import {ResumePage} from './ResumePage';

export const sharedPagesRoutes: RouteProps[] = [
    {
        path: 'no-permission',
        element: <NoPermissionPage />,
    },
    {
        path: 'resume',
        element: <ResumePage />,
    },
    {
        index: true,
        element: <MainPage />,
    },
    {
        path: 'admin/nowadays',
        element: <AdminNowadaysPage />,
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
];
