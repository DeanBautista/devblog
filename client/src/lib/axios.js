// lib/api.js
import axios from 'axios';
import useAuthStore from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL || 'http://localhost:3000',
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
        const res = await axios.post(
          'http://localhost:3000/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        

        const newAccessToken = res.data.accessToken;
        useAuthStore.setState({ accessToken: newAccessToken });
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);
      } catch {
        useAuthStore.setState({ user: null, accessToken: null });
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;