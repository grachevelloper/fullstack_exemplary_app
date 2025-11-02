import axios, {AxiosInstance} from 'axios';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: `/api`,
    timeout: 3000,
    headers: {'Content-Type': 'application/json', Authorization: ''},
});

axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('Error from backend');
        return Promise.reject(error);
    }
);

//Let typescript see types without <AxiosResponse<any, any, {}>.data: any>
export const todoQuery = {
    get: <T = any>(url: string) => axiosInstance.get<T>(url) as Promise<T>,
    post: <T = any>(url: string, data?: any) =>
        axiosInstance.post<T>(url, data) as Promise<T>,
    put: <T = any>(url: string, data?: any) =>
        axiosInstance.put<T>(url, data) as Promise<T>,
    delete: <T = any>(url: string) =>
        axiosInstance.delete<T>(url) as Promise<T>,
};
