import {TokenManager} from '../store/token-manager';
import axios from 'axios';

export const createBaseQuery = (tokenManager: TokenManager) => {
    const baseQuery = axios.create({
        baseURL: '/api',
        timeout: 3000,
        headers: {'Content-Type': 'application/json'},
    });

    baseQuery.interceptors.request.use((config) => {
        const token = tokenManager.authToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    return baseQuery;
};
