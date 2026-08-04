import type {ReactElement} from 'react';
import {BrowserRouter, Route, RouteProps, Routes} from 'react-router-dom';

import {Role} from '@/typings/common';
import {usersRoutes} from '@/users/pages';

import {articlesRoutes} from '@/articles/pages';
import {todosRoutes} from '@/todos/pages';

import {AuthLayout} from '../components/AuthLayout';
import {Layout} from '../components/Layout';
import {ProtectedRoute} from '../components/ProtectedRoute';
import {sharedPagesRoutes} from '../pages';
import {AdminNowadaysPage} from '../pages/AdminNowadaysPage';
import {MainPage} from '../pages/MainPage';
import {ResumePage} from '../pages/ResumePage';

const routes: RouteProps[] = [
    ...todosRoutes,
    ...usersRoutes.slice(2),
    ...articlesRoutes,
];

const authRoutes: RouteProps[] = [...usersRoutes.slice(0, 2)];

const protectedRoutes: Record<string, Role[] | undefined> = {
    'admin/nowadays': [Role.ADMIN],
    'articles/draft/:id': [Role.ADMIN, Role.WRITER],
    'articles/drafts': [Role.ADMIN, Role.WRITER],
    'todos/new': [Role.ADMIN],
    user: undefined,
};

const renderRouteElement = (route: RouteProps) => {
    if (!route.path || !(route.path in protectedRoutes)) {
        return route.element;
    }

    return (
        <ProtectedRoute allowedRoles={protectedRoutes[route.path]}>
            {route.element as ReactElement}
        </ProtectedRoute>
    );
};

export const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />} path='/'>
                    <Route index element={<MainPage />} />
                    <Route path='resume' element={<ResumePage />} />
                    <Route
                        path='admin/nowadays'
                        element={<AdminNowadaysPage />}
                    />
                    {routes.map((route: RouteProps) => (
                        <Route
                            key={route.path}
                            element={renderRouteElement(route)}
                            path={route.path}
                        />
                    ))}
                </Route>
                <Route element={<AuthLayout />} path='/auth'>
                    {authRoutes.map((route: RouteProps) => (
                        <Route
                            key={route.path}
                            element={route.element}
                            path={route.path}
                        />
                    ))}
                </Route>
                <Route path='/'>
                    {sharedPagesRoutes.map((route: RouteProps) => (
                        <Route
                            key={route.path}
                            element={route.element}
                            path={route.path}
                            index={route.index}
                        />
                    ))}
                </Route>
            </Routes>
        </BrowserRouter>
    );
};
