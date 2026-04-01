import api from './axios';

export async function getPublicHomeData() {
  const response = await api.get('/api/public/home');
  return response.data;
}

export async function getPublicArticles({ page = 1, limit = 6, q = '' } = {}) {
  const params = { page, limit };

  if (typeof q === 'string' && q.trim()) {
    params.q = q.trim();
  }

  const response = await api.get('/api/public/articles', {
    params,
  });

  return response.data;
}
