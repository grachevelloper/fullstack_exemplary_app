import {Navigate} from 'react-router-dom';

import {useAuth} from '@/shared/context';
import {Role} from '@/typings/common';

interface ProtectedRouteProps {
    allowedRoles?: Role[];
    children: React.ReactElement;
}

export const ProtectedRoute = ({allowedRoles, children}: ProtectedRouteProps) => {
    const {isAuthLoading, user} = useAuth();

    if (isAuthLoading) {
        return null;
    }

    if (!user) {
        return <Navigate to='/auth/signin' replace />;
    }

    if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
        return <Navigate to='/no-permission' replace />;
    }

    return children;
};
