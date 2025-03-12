import axios from 'axios';
import type { AxiosResponse, AxiosRequestConfig } from 'axios';


export async function useApiFetch<T>(
    endpoint: string,
    options: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> {
    const config = useRuntimeConfig();
    const baseURL = config.public.API_BASE_URL;

    const instance = axios.create({
        baseURL
    });

    // Add request interceptors if needed
    instance.interceptors.request.use(
        (config) => {
            // You can add headers, auth tokens, etc.
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Add response interceptors if needed
    instance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            console.error('API request failed:', error);
            return Promise.reject(error);
        }
    );

    // Execute the request
    return instance({
        url: endpoint,
        ...options
    });
}
