import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { deleteAdminPost, getAdminPosts } from "../../../../lib/posts";
import useAuthStore from "../../../../stores/authStore";
import useDebouncedValue from "../../../../hooks/useDebouncedValue";
import { POSTS_PER_PAGE, DEFAULT_PAGINATION } from "../constants";
import { normalizePageParam, mapPostForCard } from "../helpers";

export default function usePostsData() {
    const { user, accessToken } = useAuthStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = normalizePageParam(searchParams.get("page"));

    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [actionError, setActionError] = useState("");
    const [deletingPostId, setDeletingPostId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const normalizedSearchTerm = searchTerm.trim();
    const debouncedSearchTerm = useDebouncedValue(normalizedSearchTerm, 400);
    const isSearchPending =
        normalizedSearchTerm.length >= 1 && normalizedSearchTerm !== debouncedSearchTerm;

    const applyPostsResponse = (responseBody, fallbackPage) => {
        const rows = Array.isArray(responseBody.data) ? responseBody.data : [];
        const apiPagination = responseBody.pagination ?? {};
        const totalValue = Number.parseInt(apiPagination.total, 10);
        const totalPagesValue = Number.parseInt(apiPagination.totalPages, 10);
        const pageValue = normalizePageParam(apiPagination.page ?? fallbackPage);

        setPosts(rows.map((postRow, index) => mapPostForCard(postRow, index)));
        setPagination({
            page: pageValue,
            limit: POSTS_PER_PAGE,
            total: Number.isFinite(totalValue) && totalValue > 0 ? totalValue : 0,
            totalPages: Number.isFinite(totalPagesValue) && totalPagesValue > 0 ? totalPagesValue : 1,
            hasPrev: pageValue > 1,
            hasNext: Number.isFinite(totalPagesValue) ? pageValue < totalPagesValue : false,
        });
    };

    useEffect(() => {
        if (!user || !accessToken) return;

        let shouldIgnore = false;

        const loadPosts = async () => {
            setIsLoading(true);
            setLoadError("");

            try {
                const responseBody = await getAdminPosts({
                    page: currentPage,
                    limit: POSTS_PER_PAGE,
                    status: filterStatus,
                });

                if (shouldIgnore) return;

                applyPostsResponse(responseBody ?? {}, currentPage);
            } catch {
                if (shouldIgnore) return;

                setPosts([]);
                setPagination({
                    page: currentPage,
                    limit: POSTS_PER_PAGE,
                    total: 0,
                    totalPages: 1,
                    hasPrev: currentPage > 1,
                    hasNext: false,
                });
                setLoadError("Unable to load posts right now.");
            } finally {
                if (!shouldIgnore) {
                    setIsLoading(false);
                }
            }
        };

        loadPosts();

        return () => {
            shouldIgnore = true;
        };
    }, [currentPage, filterStatus, user, accessToken]);

    useEffect(() => {
        if (!user || !accessToken) return;

        let shouldIgnore = false;
        const normalizedQuery = debouncedSearchTerm.trim();

        if (normalizedQuery.length < 1) {
            setSearchResults([]);
            setIsSearching(false);
            return () => {
                shouldIgnore = true;
            };
        }

        const loadSearchResults = async () => {
            setIsSearching(true);

            try {
                const responseBody = await getAdminPosts({
                    page: 1,
                    limit: 5,
                    status: filterStatus,
                    q: normalizedQuery,
                });

                if (shouldIgnore) return;

                const rows = Array.isArray(responseBody?.data) ? responseBody.data : [];
                setSearchResults(rows);
            } catch {
                if (shouldIgnore) return;

                setSearchResults([]);
            } finally {
                if (!shouldIgnore) {
                    setIsSearching(false);
                }
            }
        };

        loadSearchResults();

        return () => {
            shouldIgnore = true;
        };
    }, [debouncedSearchTerm, filterStatus, user, accessToken]);

    const pageNumbers = useMemo(
        () => Array.from({ length: pagination.totalPages }, (_, index) => index + 1),
        [pagination.totalPages]
    );

    const shownPostsCount = useMemo(() => {
        if (pagination.total < 1) {
            return 0;
        }

        const cumulativeCount = (pagination.page - 1) * pagination.limit + posts.length;
        return Math.min(cumulativeCount, pagination.total);
    }, [pagination.limit, pagination.page, pagination.total, posts.length]);

    const showEmptyState = !isLoading && posts.length === 0 && !loadError;
    const showErrorState = !isLoading && !!loadError;
    const showActionError = !isLoading && !!actionError;

    const updatePageInUrl = (nextPage) => {
        const boundedPage = Math.min(Math.max(nextPage, 1), pagination.totalPages);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("page", String(boundedPage));
        setSearchParams(nextParams);
    };

    const handleDeletePost = async (postId) => {
        const parsedPostId = Number.parseInt(postId, 10);
        if (!Number.isInteger(parsedPostId) || parsedPostId < 1) {
            return false;
        }

        const isDeletingLastItemOnPage = posts.length === 1;

        setActionError("");
        setDeletingPostId(parsedPostId);

        try {
            await deleteAdminPost(parsedPostId);

            if (isDeletingLastItemOnPage && currentPage > 1) {
                updatePageInUrl(currentPage - 1);
            } else {
                const responseBody = await getAdminPosts({
                    page: currentPage,
                    limit: POSTS_PER_PAGE,
                    status: filterStatus,
                });

                applyPostsResponse(responseBody ?? {}, currentPage);
            }

            return true;
        } catch {
            setActionError("Unable to delete post right now.");
            return false;
        } finally {
            setDeletingPostId(null);
        }
    };

    return {
        currentPage,
        posts,
        pagination,
        isLoading,
        loadError,
        actionError,
        deletingPostId,
        filterStatus,
        setFilterStatus,
        searchTerm,
        setSearchTerm,
        searchResults,
        isSearching,
        isSearchPending,
        pageNumbers,
        shownPostsCount,
        showEmptyState,
        showErrorState,
        showActionError,
        updatePageInUrl,
        handleDeletePost,
    };
}
