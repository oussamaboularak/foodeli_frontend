import axios from 'axios';
import { cookieUtils } from '@/utils/cookies';

// Use relative URL to go through Vite proxy (configured in vite.config.ts)
const API_BASE_URL = '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for authentication
});

// Request interceptor to add the auth token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = cookieUtils.getToken();
    console.log('[API Client] Token from cookie:', token ? 'EXISTS' : 'MISSING');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Client] Authorization header set');
    } else {
      console.warn('[API Client] No token found in cookies');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
console.warn('Interceptor setup');

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.skipAuthRedirect) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh using HttpOnly cookie (automatically sent by browser)
        const response = await axios.post('http://localhost:3000/v1/auth/refresh-token', {}, {
          withCredentials: true
        });

        const { accessToken } = response.data;

        cookieUtils.setToken(accessToken);

        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;

        processQueue(null, accessToken);
        isRefreshing = false;

        return apiClient(originalRequest);

      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        // Clear tokens and redirect to login
        cookieUtils.removeToken();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
