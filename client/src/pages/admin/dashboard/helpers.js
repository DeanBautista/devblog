import { DASHBOARD_DEFAULT_SUMMARY } from './constants';

export function toNonNegativeInteger(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return parsedValue;
}

export function formatMetricValue(value) {
  return new Intl.NumberFormat('en-US').format(toNonNegativeInteger(value));
}

export function formatDateLabel(value) {
  const parsedDate = new Date(value ?? '');

  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatSyncedAtLabel(value) {
  const parsedDate = new Date(value ?? '');

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not synced yet';
  }

  return parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function createEmptyDashboardData() {
  return {
    summary: {
      ...DASHBOARD_DEFAULT_SUMMARY,
    },
    topArticles: [],
    topTags: [],
  };
}

function mapSummary(summaryInput) {
  const summary = summaryInput && typeof summaryInput === 'object' ? summaryInput : {};

  return {
    totalPosts: toNonNegativeInteger(summary.total_posts ?? summary.totalPosts),
    publishedPosts: toNonNegativeInteger(summary.published_posts ?? summary.publishedPosts),
    draftPosts: toNonNegativeInteger(summary.draft_posts ?? summary.draftPosts),
    totalViews: toNonNegativeInteger(summary.total_views ?? summary.totalViews),
    totalLikes: toNonNegativeInteger(summary.total_likes ?? summary.totalLikes),
    totalTagViews: toNonNegativeInteger(summary.total_tag_views ?? summary.totalTagViews),
  };
}

function mapTopArticle(articleRow, fallbackIndex) {
  const parsedId = Number.parseInt(articleRow?.id, 10);
  const articleId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : fallbackIndex + 1;
  const title = typeof articleRow?.title === 'string' ? articleRow.title.trim() : '';
  const slug = typeof articleRow?.slug === 'string' ? articleRow.slug.trim() : '';

  return {
    id: articleId,
    title: title || 'Untitled Post',
    slug,
    status: String(articleRow?.status ?? 'published').toUpperCase(),
    views: toNonNegativeInteger(articleRow?.views),
    likes: toNonNegativeInteger(articleRow?.likes),
    readingTime: toNonNegativeInteger(articleRow?.reading_time ?? articleRow?.readingTime),
    publishedAt: articleRow?.published_at ?? articleRow?.publishedAt ?? null,
    createdAt: articleRow?.created_at ?? articleRow?.createdAt ?? null,
  };
}

function mapTopTag(tagRow, fallbackIndex) {
  const parsedId = Number.parseInt(tagRow?.id, 10);
  const tagId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : fallbackIndex + 1;
  const tagName = typeof tagRow?.name === 'string' ? tagRow.name.trim() : '';
  const slug = typeof tagRow?.slug === 'string' ? tagRow.slug.trim() : '';

  if (!tagName) {
    return null;
  }

  return {
    id: tagId,
    name: tagName,
    slug,
    articleCount: toNonNegativeInteger(tagRow?.article_count ?? tagRow?.articleCount),
    totalViews: toNonNegativeInteger(tagRow?.total_views ?? tagRow?.totalViews),
  };
}

export function mapDashboardResponse(responseBody) {
  const payload = responseBody && typeof responseBody === 'object' ? responseBody : {};
  const data = payload.data && typeof payload.data === 'object' ? payload.data : {};

  const topArticleRows = Array.isArray(data.top_articles)
    ? data.top_articles
    : Array.isArray(data.topArticles)
    ? data.topArticles
    : [];

  const topTagRows = Array.isArray(data.top_tags)
    ? data.top_tags
    : Array.isArray(data.topTags)
    ? data.topTags
    : [];

  return {
    summary: mapSummary(data.summary),
    topArticles: topArticleRows.map((articleRow, index) => mapTopArticle(articleRow, index)),
    topTags: topTagRows.map((tagRow, index) => mapTopTag(tagRow, index)).filter(Boolean),
  };
}

export function extractDashboardErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    'Unable to load dashboard data right now.'
  );
}
