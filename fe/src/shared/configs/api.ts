import {QueryClient} from '@tanstack/react-query';
import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';

import {CustomAxiosError} from '@/typings/axios';

const redirectTo = (pathname: string) => {
    if (window.location.pathname !== pathname) {
        window.location.assign(pathname);
    }
};

export const apiAxios: AxiosInstance = axios.create({
    baseURL: `/api`,
    timeout: 3000,
    headers: {'Content-Type': 'application/json'},
    withCredentials: true,
});

let refreshRequest: Promise<void> | undefined;

const refreshAuth = () => {
    if (!refreshRequest) {
        refreshRequest = apiAxios
            .post('/auth/refresh', undefined, {skipAuthRedirect: true})
            .then(() => undefined)
            .finally(() => {
                refreshRequest = undefined;
            });
    }

    return refreshRequest;
};

apiAxios.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    async (error: CustomAxiosError) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        if (originalRequest?.url?.includes('/auth/refresh')) {
            if (status === 401) {
                return Promise.reject(error);
            }
        }

        if (
            status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.skipAuthRedirect
        ) {
            try {
                originalRequest._retry = true;
                await refreshAuth();
                return apiAxios(originalRequest);
            } catch {
                return Promise.reject(error);
            }
        }

        if (status === 403) {
            redirectTo('/no-permission');
        }

        if (status === 404) {
            redirectTo('/not-found');
        }

        return Promise.reject(error);
    }
);

export const query = {
    get: <T = any>(url: string, config?: AxiosRequestConfig) =>
        apiAxios.get<T>(url, config) as Promise<T>,

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiAxios.post<T>(url, data, config) as Promise<T>,

    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiAxios.patch<T>(url, data, config) as Promise<T>,

    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiAxios.put<T>(url, data, config) as Promise<T>,

    delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
        apiAxios.delete<T>(url, config) as Promise<T>,
};

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
            retry: 3,
            refetchOnReconnect: true,
            refetchOnMount: true,
        },
    },
});
