import { apiClient, configureApiClient } from 'shared-unihire';

const host = window.location.hostname;
const baseURL = import.meta.env.VITE_API_URL || `http://${host}:8080/api`;

configureApiClient({
  baseURL,
  getToken: () => localStorage.getItem('token'),
  onUnauthorized: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
});

export default apiClient;
