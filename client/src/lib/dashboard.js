import api from './axios';

export async function getAdminDashboardOverview() {
  const response = await api.get('/api/dashboard');
  return response.data;
}
