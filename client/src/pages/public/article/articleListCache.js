const archiveListCache = new Map();
const ARTICLE_LIST_CACHE_TTL_MS = 10 * 60 * 1000;

function toPositiveInteger(value, fallbackValue) {
    const parsedValue = Number.parseInt(value, 10);

    if (!Number.isFinite(parsedValue) || parsedValue < 1) {
        return fallbackValue;
    }

    return parsedValue;
}

function normalizeTagKey(tagSlug) {
    if (typeof tagSlug !== 'string') {
        return 'all';
    }

    const normalizedTag = tagSlug.trim();
    return normalizedTag || 'all';
}

export function createArticleListCacheKey({ page = 1, tagSlug = '', limit = 6 } = {}) {
    const safePage = toPositiveInteger(page, 1);
    const safeLimit = toPositiveInteger(limit, 6);
    const normalizedTag = normalizeTagKey(tagSlug);

    return `${normalizedTag}::${safePage}::${safeLimit}`;
}

export function readArticleListCacheEntry(cacheKey) {
    if (typeof cacheKey !== 'string' || !cacheKey) {
        return null;
    }

    const cachedEntry = archiveListCache.get(cacheKey);

    if (!cachedEntry) {
        return null;
    }

    const fetchedAt = Number(cachedEntry.fetchedAt);
    const cacheAge = Date.now() - fetchedAt;

    if (!Number.isFinite(fetchedAt) || fetchedAt <= 0 || !Number.isFinite(cacheAge) || cacheAge < 0 || cacheAge >= ARTICLE_LIST_CACHE_TTL_MS) {
        archiveListCache.delete(cacheKey);
        return null;
    }

    const rows = Array.isArray(cachedEntry.articles) ? cachedEntry.articles : null;
    const pagination = cachedEntry.pagination && typeof cachedEntry.pagination === 'object'
        ? cachedEntry.pagination
        : null;

    if (!rows || !pagination) {
        archiveListCache.delete(cacheKey);
        return null;
    }

    return {
        articles: rows,
        pagination,
    };
}

export function writeArticleListCacheEntry(cacheKey, nextValue) {
    if (typeof cacheKey !== 'string' || !cacheKey) {
        return false;
    }

    const rows = Array.isArray(nextValue?.articles) ? nextValue.articles : null;
    const pagination = nextValue?.pagination && typeof nextValue.pagination === 'object'
        ? nextValue.pagination
        : null;

    if (!rows || !pagination) {
        return false;
    }

    archiveListCache.set(cacheKey, {
        articles: rows,
        pagination,
        fetchedAt: Date.now(),
    });

    return true;
}