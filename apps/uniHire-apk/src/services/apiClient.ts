import { apiClient, configureApiClient } from 'shared-unihire';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// The LAN IP where your backend is running. Adjust this if your computer's IP changes.
const BACKEND_URL = 'http://192.168.0.122:8080/api';

configureApiClient({
  baseURL: BACKEND_URL,
  getToken: async () => {
    return await SecureStore.getItemAsync('token');
  },
  onUnauthorized: async () => {
    await SecureStore.deleteItemAsync('token');
    router.replace('/login');
  },
});

export default apiClient;
