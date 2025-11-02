import {baseQuery} from '../lib';

interface Tokens {
    authToken?: string;
    refreshToken?: string;
}

interface UserData {
    email: string;
    password: string;
}
export default {
    getRefreshToken: async ({authToken, refreshToken}: Tokens) => {
        if (!authToken) {
            throw Error('Auth token must be provided');
        }
        const response = await baseQuery.post('refresh', {
            authToken,
            refreshToken,
        });

        return response.data;
    },

    getAuthToken: async ({email, password}: UserData) => {
        if (!email || !password) {
            throw Error('Email and password  must be provided');
        }
        const response = await baseQuery.post('refresh', {
            email,
            password,
        });

        return response.data;
    },
};
