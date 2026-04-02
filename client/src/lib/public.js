import api from './axios';

export async function getPublicHomeData() {
  const response = await api.get('/api/public/home');
  return response.data;
}

export async function getPublicTags() {
  const response = await api.get('/api/public/tags');
  return response.data;
}

export async function getPublicArticles({ page = 1, limit = 6, q = '', tag = '' } = {}) {
  const params = { page, limit };

  if (typeof q === 'string' && q.trim()) {
    params.q = q.trim();
  }

  if (typeof tag === 'string' && tag.trim()) {
    params.tag = tag.trim();
  }

  const response = await api.get('/api/public/articles', {
    params,
  });

  return response.data;
}
