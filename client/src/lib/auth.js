// lib/auth.js
import api from './axios';

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  await api.post('/api/auth/logout');
};

export const refreshToken = async () => {
  const response = await api.post('/api/auth/refresh', {}, { withCredentials: true });
  return response.data;
};

export const init = async () => {
  const response = await api.post('/api/auth/init');
  return response.data;
};