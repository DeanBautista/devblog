import api from './axios';

export async function getPublicHomeData() {
  const response = await api.get('/api/public/home');
  return response.data;
}

export async function getPublicWarmup() {
  const response = await api.get('/api/public/warmup');
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

export async function getPublicArticleBySlug(slug) {
  const normalizedSlug = typeof slug === 'string' ? slug.trim() : '';

  if (!normalizedSlug) {
    throw new Error('Article slug is required');
  }

  const response = await api.get(`/api/public/articles/${encodeURIComponent(normalizedSlug)}`);
  return response.data;
}

export async function recordPublicArticleView(slug) {
  const normalizedSlug = typeof slug === 'string' ? slug.trim() : '';

  if (!normalizedSlug) {
    throw new Error('Article slug is required');
  }

  const response = await api.post(`/api/public/articles/${encodeURIComponent(normalizedSlug)}/view`);
  return response.data;
}

export async function togglePublicArticleLike(slug, action) {
  const normalizedSlug = typeof slug === 'string' ? slug.trim() : '';
  const normalizedAction = typeof action === 'string' ? action.trim().toLowerCase() : '';

  if (!normalizedSlug) {
    throw new Error('Article slug is required');
  }

  if (!normalizedAction) {
    throw new Error('Like action is required');
  }

  const response = await api.post(`/api/public/articles/${encodeURIComponent(normalizedSlug)}/like`, {
    action: normalizedAction,
  });
  return response.data;
}
