export const ARTICLES_PER_PAGE = 6;

export const ALL_TAG_OPTION = {
    id: 'all',
    name: 'All',
    slug: '',
};

export const DEFAULT_PAGINATION = {
    page: 1,
    limit: ARTICLES_PER_PAGE,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
};

export const ARTICLE_LIKE_ACTIONS = {
    LIKE: 'like',
    UNLIKE: 'unlike',
};

export const ARTICLE_ENGAGEMENT_STORAGE_KEYS = {
    viewedArticles: 'devblog.public.article.viewed.v1',
    likedArticles: 'devblog.public.article.liked.v1',
};
