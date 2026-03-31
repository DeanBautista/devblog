// lib/auth.js
import api from './axios';

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  await api.post('/api/auth/logout');
};

// ✅ plain axios — bypasses the interceptor, no infinite loop
export const refreshToken = async () => {
  console.log('tamaki:  ', api.defaults.baseURL);
  const response = await api.post(
    'http://localhost:3000/api/auth/refresh',
    {},
    { withCredentials: true }
  );
  return response.data;
};

export const init = async () => {
  const response = await api.post('/api/auth/init');
  return response.data;
};