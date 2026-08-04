import {query} from '@/shared/configs/api';

import {Nowadays, User} from '../types';

import {
    DtoChangePassword,
    DtoSignInUser,
    DtoSignUpUser,
    DtoUpdateUser,
    SignResponse,
    type UserApi,
} from './types';

class FetchApiError extends Error {
    isAxiosError = true;
    response: {
        data: unknown;
        status: number;
    };

    constructor(status: number, data: unknown) {
        super(`Request failed with status code ${status}`);
        this.response = {data, status};
    }
}

const Api: UserApi = {
    signIn: async (data: DtoSignInUser) => {
        const response = await fetch('/api/auth/signin', {
            method: 'POST',
            credentials: 'include',
            keepalive: true,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new FetchApiError(response.status, responseData);
        }

        return responseData as SignResponse;
    },

    signUp: async (data: DtoSignUpUser) => {
        const result = await query.post<User>(`/auth/signup`, data);
        return result;
    },

    logout: async () => {
        await query.post('/auth/logout');
    },

    getMe: async () => {
        return await query.get<User>('/users/me');
    },

    getNowadays: async () => {
        return await query.get<Nowadays | null>('/users/nowadays');
    },

    updateMe: async (data: Omit<DtoUpdateUser, 'id'>) => {
        return await query.patch<User>('/users/me', data);
    },

    changeMyPassword: async (data: DtoChangePassword) => {
        await query.patch('/users/me/password', data);
    },

    getUserById: async (id: string) => {
        return await query.get<User>(`/users/${id}`);
    },

    updateUserById: async ({id, ...data}: DtoUpdateUser) => {
        const response = await query.patch<User>(`/users/${id}`, data);
        return response;
    },

    changeUserPassword: async (id: string, data: DtoChangePassword) => {
        await query.patch(`/users/${id}/password`, data);
    },

    deleteUserById: async (id: string) => {
        await query.delete(`/users/${id}`);
    },
};

export default Api;
