import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDebouncedValue from '../../../../hooks/useDebouncedValue';
import {
    createAdminTag,
    deleteAdminTag,
    getAdminTagPosts,
    getAdminTags,
    updateAdminTag,
} from '../../../../lib/tags';
import { normalizeSlug } from '../../../../utils/slug';
import {
    TAGS_PER_PAGE,
    TAG_POSTS_PER_PAGE,
    DEFAULT_PAGINATION,
    createTagPostsState,
} from '../constants';
import {
    normalizePageParam,
    mapTagRow,
    mapTagPost,
    extractErrorMessage,
} from '../helpers';

export default function useTagsData() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = normalizePageParam(searchParams.get('page'));

    const [tags, setTags] = useState([]);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [actionError, setActionError] = useState('');
    const [refreshNonce, setRefreshNonce] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const normalizedSearchTerm = searchTerm.trim();
    const debouncedSearchTerm = useDebouncedValue(normalizedSearchTerm, 350);

    const [createName, setCreateName] = useState('');
    const [createSlug, setCreateSlug] = useState('');
    const [isCreateSlugDirty, setIsCreateSlugDirty] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    const [updatingTagId, setUpdatingTagId] = useState(null);
    const [deletingTagId, setDeletingTagId] = useState(null);
    const [pendingDeleteTag, setPendingDeleteTag] = useState(null);

    const [expandedTagId, setExpandedTagId] = useState(null);
    const [tagPostsById, setTagPostsById] = useState({});

    const pageNumbers = useMemo(
        () => Array.from({ length: pagination.totalPages }, (_, index) => index + 1),
        [pagination.totalPages]
    );

    const shownTagsCount = useMemo(() => {
        if (pagination.total < 1) {
            return 0;
        }

        const cumulativeCount = (pagination.page - 1) * pagination.limit + tags.length;
        return Math.min(cumulativeCount, pagination.total);
    }, [pagination.limit, pagination.page, pagination.total, tags.length]);

    function updatePageInUrl(nextPage) {
        const safeMaxPage = Math.max(1, pagination.totalPages);
        const boundedPage = Math.min(Math.max(nextPage, 1), safeMaxPage);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('page', String(boundedPage));
        setSearchParams(nextParams);
    }

    function applyTagsResponse(responseBody, fallbackPage) {
        const rows = Array.isArray(responseBody?.data) ? responseBody.data : [];
        const apiPagination = responseBody?.pagination ?? {};

        const total = Number.parseInt(apiPagination.total, 10);
        const totalPages = Number.parseInt(apiPagination.totalPages, 10);
        const page = normalizePageParam(apiPagination.page ?? fallbackPage);

        setTags(rows.map(mapTagRow).filter(Boolean));
        setPagination({
            page,
            limit: TAGS_PER_PAGE,
            total: Number.isFinite(total) && total > 0 ? total : 0,
            totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
            hasPrev: page > 1,
            hasNext: Number.isFinite(totalPages) ? page < totalPages : false,
        });
    }

    async function loadTagPosts(tagId, page = 1) {
        setTagPostsById((previousState) => {
            const currentTagState = previousState[tagId] ?? createTagPostsState();

            return {
                ...previousState,
                [tagId]: {
                    ...currentTagState,
                    isLoading: true,
                    errorMessage: '',
                },
            };
        });

        try {
            const response = await getAdminTagPosts(tagId, {
                page,
                limit: TAG_POSTS_PER_PAGE,
            });

            const rows = Array.isArray(response?.data) ? response.data : [];
            const apiPagination = response?.pagination ?? {};
            const total = Number.parseInt(apiPagination.total, 10) || 0;
            const totalPages = Number.parseInt(apiPagination.totalPages, 10) || 1;
            const current = normalizePageParam(apiPagination.page ?? page);

            setTagPostsById((previousState) => ({
                ...previousState,
                [tagId]: {
                    posts: rows.map(mapTagPost).filter(Boolean),
                    isLoading: false,
                    isLoaded: true,
                    errorMessage: '',
                    pagination: {
                        page: current,
                        limit: TAG_POSTS_PER_PAGE,
                        total,
                        totalPages: Math.max(totalPages, 1),
                        hasPrev: current > 1,
                        hasNext: current < Math.max(totalPages, 1),
                    },
                },
            }));
        } catch (error) {
            const message = extractErrorMessage(error, 'Unable to load posts for this tag.');

            setTagPostsById((previousState) => ({
                ...previousState,
                [tagId]: {
                    ...(previousState[tagId] ?? createTagPostsState()),
                    isLoading: false,
                    isLoaded: true,
                    errorMessage: message,
                },
            }));
        }
    }

    useEffect(() => {
        let shouldIgnore = false;

        async function loadTags() {
            setIsLoading(true);
            setLoadError('');

            try {
                const response = await getAdminTags({
                    page: currentPage,
                    limit: TAGS_PER_PAGE,
                    q: debouncedSearchTerm,
                });

                if (shouldIgnore) return;

                applyTagsResponse(response ?? {}, currentPage);
            } catch (error) {
                if (shouldIgnore) return;

                const message = extractErrorMessage(error, 'Unable to load tags right now.');

                setTags([]);
                setPagination({
                    page: currentPage,
                    limit: TAGS_PER_PAGE,
                    total: 0,
                    totalPages: 1,
                    hasPrev: currentPage > 1,
                    hasNext: false,
                });
                setLoadError(message);
            } finally {
                if (!shouldIgnore) {
                    setIsLoading(false);
                }
            }
        }

        loadTags();

        return () => {
            shouldIgnore = true;
        };
    }, [currentPage, debouncedSearchTerm, refreshNonce]);

    function handleCreateNameChange(event) {
        const nextName = event.target.value;
        setCreateName(nextName);

        if (!isCreateSlugDirty) {
            setCreateSlug(normalizeSlug(nextName));
        }
    }

    function handleCreateSlugChange(event) {
        setIsCreateSlugDirty(true);
        setCreateSlug(normalizeSlug(event.target.value));
    }

    async function handleCreateTag(event) {
        event.preventDefault();

        const normalizedName = createName.trim();
        const normalizedSlug = normalizeSlug(createSlug) || normalizeSlug(normalizedName);

        if (!normalizedName || !normalizedSlug) {
            setCreateError('Tag name and slug are required.');
            return;
        }

        setCreateError('');
        setActionError('');
        setIsCreating(true);

        try {
            await createAdminTag({
                name: normalizedName,
                slug: normalizedSlug,
            });

            setCreateName('');
            setCreateSlug('');
            setIsCreateSlugDirty(false);

            if (currentPage !== 1) {
                updatePageInUrl(1);
            } else {
                setRefreshNonce((previous) => previous + 1);
            }
        } catch (error) {
            const message = extractErrorMessage(error, 'Unable to create tag right now.');
            setCreateError(message);
        } finally {
            setIsCreating(false);
        }
    }

    async function handleUpdateTag(tagId, values) {
        const normalizedName = String(values?.name ?? '').trim();
        const normalizedSlug = normalizeSlug(values?.slug) || normalizeSlug(normalizedName);

        if (!normalizedName || !normalizedSlug) {
            setActionError('Tag name and slug are required.');
            return false;
        }

        setActionError('');
        setUpdatingTagId(tagId);

        try {
            await updateAdminTag(tagId, {
                name: normalizedName,
                slug: normalizedSlug,
            });

            setRefreshNonce((previous) => previous + 1);
            return true;
        } catch (error) {
            const message = extractErrorMessage(error, 'Unable to update tag right now.');
            setActionError(message);
            return false;
        } finally {
            setUpdatingTagId(null);
        }
    }

    function handleRequestDelete(tag) {
        setPendingDeleteTag(tag);
    }

    async function handleConfirmDelete() {
        if (!pendingDeleteTag?.id) return;

        const tagId = Number.parseInt(pendingDeleteTag.id, 10);
        if (!Number.isInteger(tagId) || tagId < 1) return;

        const isDeletingLastTagOnPage = tags.length === 1;

        setActionError('');
        setDeletingTagId(tagId);

        try {
            await deleteAdminTag(tagId);

            setPendingDeleteTag(null);
            setExpandedTagId((previousTagId) => (previousTagId === tagId ? null : previousTagId));
            setTagPostsById((previousState) => {
                const nextState = { ...previousState };
                delete nextState[tagId];
                return nextState;
            });

            if (isDeletingLastTagOnPage && currentPage > 1) {
                updatePageInUrl(currentPage - 1);
            } else {
                setRefreshNonce((previous) => previous + 1);
            }
        } catch (error) {
            const message = extractErrorMessage(error, 'Unable to delete tag right now.');
            setActionError(message);
        } finally {
            setDeletingTagId(null);
        }
    }

    function handleToggleExpand(tagId) {
        const shouldExpand = expandedTagId !== tagId;
        setExpandedTagId(shouldExpand ? tagId : null);

        if (!shouldExpand) return;

        const currentState = tagPostsById[tagId];
        if (!currentState || !currentState.isLoaded) {
            loadTagPosts(tagId, 1);
        }
    }

    function handleSearchChange(event) {
        setSearchTerm(event.target.value);
        if (currentPage !== 1) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('page', '1');
            setSearchParams(nextParams);
        }
    }

    return {
        currentPage,
        tags,
        pagination,
        isLoading,
        loadError,
        actionError,
        searchTerm,
        debouncedSearchTerm,
        createName,
        createSlug,
        isCreating,
        createError,
        updatingTagId,
        deletingTagId,
        pendingDeleteTag,
        expandedTagId,
        tagPostsById,
        pageNumbers,
        shownTagsCount,
        updatePageInUrl,
        loadTagPosts,
        handleCreateNameChange,
        handleCreateSlugChange,
        handleCreateTag,
        handleUpdateTag,
        handleRequestDelete,
        handleConfirmDelete,
        handleToggleExpand,
        handleSearchChange,
        setPendingDeleteTag,
    };
}
