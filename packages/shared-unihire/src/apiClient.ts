import axios from 'axios';

export const apiClient = axios.create();

export interface ApiClientConfig {
  baseURL: string;
  getToken: () => Promise<string | null> | string | null;
  onUnauthorized: () => void;
}

let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;

export const configureApiClient = (config: ApiClientConfig) => {
  apiClient.defaults.baseURL = config.baseURL;

  // Remove existing interceptors if configured multiple times (e.g. fast refresh)
  if (requestInterceptorId !== null) {
    apiClient.interceptors.request.eject(requestInterceptorId);
  }
  if (responseInterceptorId !== null) {
    apiClient.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = apiClient.interceptors.request.use(async (reqConfig) => {
    const token = await config.getToken();
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  });

  responseInterceptorId = apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        config.onUnauthorized();
      }
      return Promise.reject(error);
    }
  );
};
