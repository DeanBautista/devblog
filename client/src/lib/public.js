import api from './axios';

export async function getPublicHomeData() {
  const response = await api.get('/api/public/home');
  return response.data;
}
