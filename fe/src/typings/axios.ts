import {AxiosError, InternalAxiosRequestConfig} from 'axios';

export interface CustomAxiosError extends AxiosError {
    config: InternalAxiosRequestConfig & {
        _retry?: boolean;
    };
}

export interface ApiErrorResponse {
    message?: string;
    error?: string;
    statusCode?: number;
}
