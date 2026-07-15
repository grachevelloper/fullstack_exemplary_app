import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';

import {query} from '@/shared/configs/api';
import {type User} from '@/users/types';

import {UserContextType, UserVoid} from './types';

const AuthContext = createContext<UserContextType>(UserVoid);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
    children,
}) => {
    const [user, setUserData] = useState<User | undefined>();
    const [isAuthLoading, setAuthLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const currentUser = await query.get<User>('/auth/me', {
                skipAuthRedirect: true,
            });
            setUserData(currentUser);
            return currentUser;
        } catch {
            setUserData(undefined);
            return undefined;
        } finally {
            setAuthLoading(false);
        }
    }, []);

    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);

    const value = {
        isAuthLoading,
        refreshUser,
        user,
        setUserData,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = (): UserContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
