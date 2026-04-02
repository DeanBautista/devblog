import { normalizeSlug } from '../../../utils/slug';
import { ARTICLES_PER_PAGE } from './constants';

export function normalizePageParam(pageParam) {
    const parsedValue = Number.parseInt(pageParam ?? '1', 10);
    if (!Number.isFinite(parsedValue) || parsedValue < 1) {
        return 1;
    }

    return parsedValue;
}

export function normalizePagination(apiPagination, fallbackPage) {
    const totalValue = Number.parseInt(apiPagination?.total, 10);
    const totalPagesValue = Number.parseInt(apiPagination?.totalPages, 10);
    const pageValue = normalizePageParam(apiPagination?.page ?? fallbackPage);

    return {
        page: pageValue,
        limit: ARTICLES_PER_PAGE,
        total: Number.isFinite(totalValue) && totalValue > 0 ? totalValue : 0,
        totalPages: Number.isFinite(totalPagesValue) && totalPagesValue > 0 ? totalPagesValue : 1,
        hasPrev: pageValue > 1,
        hasNext: Number.isFinite(totalPagesValue) ? pageValue < totalPagesValue : false,
    };
}

export function normalizeTagSlugParam(tagParam) {
    if (typeof tagParam !== 'string') {
        return '';
    }

    return normalizeSlug(tagParam);
}

export function normalizePublicTags(tagsValue) {
    if (!Array.isArray(tagsValue)) {
        return [];
    }

    const seenSlugs = new Set();

    return tagsValue.reduce((normalizedTags, tagRow) => {
        const parsedId = Number.parseInt(tagRow?.id, 10);
        const tagName = typeof tagRow?.name === 'string' ? tagRow.name.trim() : '';
        const tagSlug = normalizeTagSlugParam(tagRow?.slug || tagName);

        if (!tagName || !tagSlug || seenSlugs.has(tagSlug)) {
            return normalizedTags;
        }

        seenSlugs.add(tagSlug);

        normalizedTags.push({
            id: Number.isInteger(parsedId) && parsedId > 0 ? parsedId : tagSlug,
            name: tagName,
            slug: tagSlug,
        });

        return normalizedTags;
    }, []);
}
