import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDebouncedValue from '../../../../hooks/useDebouncedValue';
import { getPublicArticles, getPublicTags } from '../../../../lib/public';
import { ARTICLES_PER_PAGE, DEFAULT_PAGINATION, ALL_TAG_OPTION } from '../constants';
import { normalizePageParam, normalizePagination, normalizeTagSlugParam, normalizePublicTags } from '../helpers';

export default function useArticleData() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = normalizePageParam(searchParams.get('page'));
    const selectedTagSlug = normalizeTagSlugParam(searchParams.get('tag'));

    const [searchTerm, setSearchTerm] = useState('');
    const [articles, setArticles] = useState([]);
    const [archiveTags, setArchiveTags] = useState([]);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const [isLoading, setIsLoading] = useState(true);
    const [areTagsLoading, setAreTagsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const normalizedSearchTerm = searchTerm.trim();
    const debouncedSearchTerm = useDebouncedValue(normalizedSearchTerm, 400);
    const isSearchPending =
        normalizedSearchTerm.length >= 1 && normalizedSearchTerm !== debouncedSearchTerm;

    useEffect(() => {
        let shouldIgnore = false;

        async function loadArchiveTags() {
            setAreTagsLoading(true);

            try {
                const response = await getPublicTags();

                if (shouldIgnore) return;

                if (!response?.success) {
                    throw new Error('Tag request failed');
                }

                const rows = Array.isArray(response.data) ? response.data : [];
                setArchiveTags(normalizePublicTags(rows));
            } catch {
                if (shouldIgnore) return;

                setArchiveTags([]);
            } finally {
                if (!shouldIgnore) {
                    setAreTagsLoading(false);
                }
            }
        }

        loadArchiveTags();

        return () => {
            shouldIgnore = true;
        };
    }, []);

    useEffect(() => {
        let shouldIgnore = false;

        async function loadArticles() {
            setIsLoading(true);
            setLoadError('');

            try {
                const response = await getPublicArticles({
                    page: currentPage,
                    limit: ARTICLES_PER_PAGE,
                    tag: selectedTagSlug,
                });

                if (shouldIgnore) return;

                if (!response?.success) {
                    throw new Error('Request failed');
                }

                const rows = Array.isArray(response.data) ? response.data : [];
                const nextPagination = normalizePagination(response.pagination, currentPage);

                setArticles(rows);
                setPagination(nextPagination);

                if (nextPagination.page !== currentPage) {
                    const nextParams = new URLSearchParams();

                    if (selectedTagSlug) {
                        nextParams.set('tag', selectedTagSlug);
                    }

                    nextParams.set('page', String(nextPagination.page));
                    setSearchParams(nextParams);
                }
            } catch {
                if (shouldIgnore) return;

                setArticles([]);
                setPagination({
                    page: currentPage,
                    limit: ARTICLES_PER_PAGE,
                    total: 0,
                    totalPages: 1,
                    hasPrev: currentPage > 1,
                    hasNext: false,
                });
                setLoadError('Unable to load articles right now.');
            } finally {
                if (!shouldIgnore) {
                    setIsLoading(false);
                }
            }
        }

        loadArticles();

        return () => {
            shouldIgnore = true;
        };
    }, [currentPage, selectedTagSlug, setSearchParams]);

    useEffect(() => {
        let shouldIgnore = false;
        const normalizedQuery = debouncedSearchTerm.trim();

        if (normalizedQuery.length < 1) {
            setSearchResults([]);
            setIsSearching(false);
            return () => {
                shouldIgnore = true;
            };
        }

        async function loadSearchResults() {
            setIsSearching(true);

            try {
                const response = await getPublicArticles({
                    page: 1,
                    limit: 5,
                    q: normalizedQuery,
                });

                if (shouldIgnore) return;

                if (!response?.success) {
                    throw new Error('Search request failed');
                }

                const rows = Array.isArray(response.data) ? response.data : [];
                setSearchResults(rows);
            } catch {
                if (shouldIgnore) return;

                setSearchResults([]);
            } finally {
                if (!shouldIgnore) {
                    setIsSearching(false);
                }
            }
        }

        loadSearchResults();

        return () => {
            shouldIgnore = true;
        };
    }, [debouncedSearchTerm]);

    const pageNumbers = useMemo(
        () => Array.from({ length: pagination.totalPages }, (_, index) => index + 1),
        [pagination.totalPages]
    );

    const shownArticlesCount = useMemo(() => {
        if (pagination.total < 1) {
            return 0;
        }

        const cumulativeCount = (pagination.page - 1) * pagination.limit + articles.length;
        return Math.min(cumulativeCount, pagination.total);
    }, [articles.length, pagination.limit, pagination.page, pagination.total]);

    const availableArchiveTags = useMemo(() => [ALL_TAG_OPTION, ...archiveTags], [archiveTags]);

    const archiveHeading = useMemo(() => {
        if (!selectedTagSlug) {
            return 'All Posts';
        }

        const matchedTag = archiveTags.find((tagOption) => tagOption.slug === selectedTagSlug);
        return matchedTag ? `${matchedTag.name} Posts` : 'Filtered Posts';
    }, [archiveTags, selectedTagSlug]);

    function updatePageInUrl(nextPage) {
        const safeMaxPage = Math.max(1, pagination.totalPages);
        const boundedPage = Math.min(Math.max(nextPage, 1), safeMaxPage);

        if (boundedPage === currentPage) {
            return;
        }

        const nextParams = new URLSearchParams();

        if (selectedTagSlug) {
            nextParams.set('tag', selectedTagSlug);
        }

        nextParams.set('page', String(boundedPage));
        setSearchParams(nextParams);
    }

    function updateTagInUrl(nextTagSlug) {
        const normalizedTagSlug = normalizeTagSlugParam(nextTagSlug);

        if (normalizedTagSlug === selectedTagSlug && currentPage === 1) {
            return;
        }

        const nextParams = new URLSearchParams();

        if (normalizedTagSlug) {
            nextParams.set('tag', normalizedTagSlug);
        }

        nextParams.set('page', '1');
        setSearchParams(nextParams);
    }

    return {
        currentPage,
        selectedTagSlug,
        searchTerm,
        setSearchTerm,
        articles,
        archiveTags,
        pagination,
        isLoading,
        areTagsLoading,
        loadError,
        searchResults,
        isSearching,
        isSearchPending,
        pageNumbers,
        shownArticlesCount,
        availableArchiveTags,
        archiveHeading,
        updatePageInUrl,
        updateTagInUrl,
    };
}
