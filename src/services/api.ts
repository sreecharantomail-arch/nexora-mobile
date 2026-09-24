import axios from 'axios';
import { getToken, saveToken } from '../utils/secureStore';
import { useAuthStore } from '../store/authStore';

if (!process.env.EXPO_PUBLIC_API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL environment variable is missing. Please set EXPO_PUBLIC_API_URL in your .env file.');
}

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// eslint-disable-next-line import/no-named-as-default-member
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 second timeout to accommodate media uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, delete Content-Type header so Axios generates boundary automatically
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getToken('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { token: refreshToken });
          if (res.data.success) {
            const newAccessToken = res.data.data.accessToken;
            const newRefreshToken = res.data.data.refreshToken;
            
            await saveToken('accessToken', newAccessToken);
            await saveToken('refreshToken', newRefreshToken);
            
            useAuthStore.getState().login(
              useAuthStore.getState().user!,
              newAccessToken,
              newRefreshToken
            );
            
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch {
        // If refresh token is also invalid, logout
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);
