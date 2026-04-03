// lib/api.js
import axios from 'axios';
import useAuthStore from '../stores/authStore';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : 'https://deandevblog.onrender.com');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// lib/axios.js
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // ✅ skip interceptor for auth routes
    if (
      original.url?.includes('/api/auth/refresh') ||
      original.url?.includes('/api/auth/login') ||
      original.url?.includes('/api/auth/init') ||
      original.url?.includes('/api/auth/logout')
    ) {
      return Promise.reject(error);
    }

    console.log('Original request failed:', original.url, error.response?.status);

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const baseUrl =
          typeof api.defaults.baseURL === 'string' ? api.defaults.baseURL.replace(/\/$/, '') : '';
        const refreshEndpoint = baseUrl ? `${baseUrl}/api/auth/refresh` : '/api/auth/refresh';

        const res = await axios.post(
          refreshEndpoint,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;
        useAuthStore.setState({ accessToken: newAccessToken });
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);
      } catch {
        useAuthStore.setState({ user: null, accessToken: null });
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;