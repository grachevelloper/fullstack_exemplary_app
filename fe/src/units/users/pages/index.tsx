import {RouteProps} from 'react-router-dom';

import {SignInPage} from './SignInPage';
import {SignUpPage} from './SignUpPage';

export const usersRoutes: RouteProps[] = [
    {
        path: 'signin',
        element: <SignInPage />,
    },
    {
        path: 'signup',
        element: <SignUpPage />,
    },
];
