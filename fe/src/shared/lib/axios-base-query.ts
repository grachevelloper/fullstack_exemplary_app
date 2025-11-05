import axios from 'axios';

import {TokenManager} from '../store/token-manager';

export const baseQuery = (tokenManager: TokenManager) => {
    const query = axios.create({
        baseURL: '/api',
        timeout: 3000,
        headers: {'Content-Type': 'application/json'},
    });

    query.interceptors.request.use((config) => {
        const token = tokenManager.authToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    return baseQuery;
};
