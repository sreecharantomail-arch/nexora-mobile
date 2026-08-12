import axios from 'axios';
import { getToken, saveToken } from '../utils/secureStore';
import { useAuthStore } from '../store/authStore';

// Use the live production Render API URL
const BASE_URL = 'http://localhost:5000/api';

// eslint-disable-next-line import/no-named-as-default-member
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout so it doesn't hang infinitely
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
