import {Dispatch, SetStateAction} from 'react';

import {User} from '@/users/types';

export interface UserContextType {
    isAuthLoading: boolean;
    refreshUser: () => Promise<User | undefined>;
    user?: User;
    setUserData: Dispatch<SetStateAction<User | undefined>>;
}

export const UserVoid = {
    isAuthLoading: false,
    refreshUser: () => Promise.resolve(undefined),
    user: undefined,
    setUserData: () => {},
};
