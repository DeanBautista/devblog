import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import PostCard, { PostCardSkeleton } from "../../components/posts/PostCard";
import SearchInputWithResults from "../../components/search/SearchInputWithResults";
import SearchResultCard from "../../components/search/SearchResultCard";
import api from "../../lib/axios";
import useAuthStore from "../../stores/authStore";
import useDebouncedValue from "../../hooks/useDebouncedValue";

const POSTS_PER_PAGE = 5;
const COVER_VARIANTS = ["mint", "graphite", "parchment", "ivory"];
const SKELETON_CARD_KEYS = Array.from({ length: POSTS_PER_PAGE }, (_, index) => `post-skeleton-${index}`);

const DEFAULT_PAGINATION = {
    page: 1,
    limit: POSTS_PER_PAGE,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
};

function normalizePageParam(pageParam) {
    const parsedValue = Number.parseInt(pageParam ?? "1", 10);
    if (!Number.isFinite(parsedValue) || parsedValue < 1) {
        return 1;
    }

    return parsedValue;
}

function formatPostDates(dateValue) {
    const parsedDate = new Date(dateValue ?? "");
    if (Number.isNaN(parsedDate.getTime())) {
        return {
            mobile: "N/A",
            desktop: "N/A",
        };
    }

    const formattedDate = parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const [monthAndDay = "", year = ""] = formattedDate.split(", ");
    return {
        mobile: formattedDate,
        desktop: `${monthAndDay},\n${year}`.trim(),
    };
}

function mapStatus(statusValue) {
    const normalizedStatus = String(statusValue ?? "").trim().toUpperCase();
    if (normalizedStatus === "PUBLISHED") {
        return "PUBLISHED";
    }

    return "DRAFT";
}

function mapReadTime(readingTimeValue) {
    const parsedMinutes = Number.parseInt(readingTimeValue, 10);
    if (Number.isFinite(parsedMinutes) && parsedMinutes > 0) {
        return `${parsedMinutes} min read`;
    }

    return "0 min read";
}

function mapPostForCard(postRow, fallbackIndex) {
    const parsedId = Number.parseInt(postRow?.id, 10);
    const postId = Number.isFinite(parsedId) ? parsedId : fallbackIndex + 1;
    const coverIndex = ((postId - 1) % COVER_VARIANTS.length + COVER_VARIANTS.length) % COVER_VARIANTS.length;
    const parsedViews = Number.parseInt(postRow?.views, 10);
    const { mobile, desktop } = formatPostDates(postRow?.published_at ?? postRow?.created_at);

    return {
        id: postId,
        coverVariant: COVER_VARIANTS[coverIndex],
        title: postRow?.title?.trim() || "Untitled Post",
        readTime: mapReadTime(postRow?.reading_time),
        status: mapStatus(postRow?.status),
        views: Number.isFinite(parsedViews) && parsedViews > 0 ? parsedViews : 0,
        dateMobile: mobile,
        dateDesktop: desktop,
    };
}

export default function Posts() {

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
                const response = await api.get("/api/posts", {
                    params: {
                        page: currentPage,
                        limit: POSTS_PER_PAGE,
                        status: filterStatus,
                    },
                });

                if (shouldIgnore) {
                    return;
                }

                applyPostsResponse(response.data ?? {}, currentPage);
            } catch {
                if (shouldIgnore) {
                    return;
                }

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
                const response = await api.get("/api/posts", {
                    params: {
                        page: 1,
                        limit: 5,
                        status: filterStatus,
                        q: normalizedQuery,
                    },
                });

                if (shouldIgnore) {
                    return;
                }

                const rows = Array.isArray(response.data?.data) ? response.data.data : [];
                setSearchResults(rows);
            } catch {
                if (shouldIgnore) {
                    return;
                }

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
            await api.delete(`/api/posts/${parsedPostId}`);

            if (isDeletingLastItemOnPage && currentPage > 1) {
                updatePageInUrl(currentPage - 1);
            } else {
                const response = await api.get("/api/posts", {
                    params: {
                        page: currentPage,
                        limit: POSTS_PER_PAGE,
                        status: filterStatus,
                    },
                });

                applyPostsResponse(response.data ?? {}, currentPage);
            }

            return true;
        } catch {
            setActionError("Unable to delete post right now.");
            return false;
        } finally {
            setDeletingPostId(null);
        }
    };

    const FILTER_TABS = [
        { label: "All", value: "all" },
        { label: "Published", value: "published" },
        { label: "Drafts", value: "draft" },
    ];

    return (
        <section className="min-h-screen w-full pt-14 md:pt-0">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <SearchInputWithResults
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search posts..."
                    results={isSearchPending ? [] : searchResults}
                    isLoading={isSearchPending || isSearching}
                    loadingLabel="Searching posts..."
                    emptyLabel="No matching posts found."
                    wrapperClassName="w-full max-w-md"
                    renderResult={(post, index) => (
                        <SearchResultCard
                            key={`admin-post-search-${post.id || index}`}
                            title={post?.title}
                            imageSrc={post?.cover_image}
                            index={index}
                        />
                    )}
                />

                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">All Posts</h1>

                        <div className="mt-5 flex items-center gap-6 text-sm">
                            {FILTER_TABS.map(({ label, value }) => (
                                <button
                                    key={value}
                                    onClick={() => {
                                        setFilterStatus(value);
                                        updatePageInUrl(1);
                                    }}
                                    type="button"
                                    className={`pb-1 transition-colors ${
                                        filterStatus === value
                                            ? "border-b border-primary-fixed font-medium text-on-surface"
                                            : "text-on-surface-variant hover:text-on-surface"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Link
                        to="/admin/newposts"
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-container px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        <Plus size={16} />
                        New Post
                    </Link>
                </div>

                <div>
                    <div className="hidden grid-cols-[84px_minmax(0,1.7fr)_112px_112px_108px_70px] items-center gap-4 px-5 text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/80 xl:grid">
                        <span>Cover</span>
                        <span>Title</span>
                        <span>Status</span>
                        <span>Views</span>
                        <span>Date</span>
                        <span>Actions</span>
                    </div>

                    <div className="mt-3 flex flex-col gap-3">
                        {isLoading &&
                            SKELETON_CARD_KEYS.map((skeletonKey) => (
                                <PostCardSkeleton key={skeletonKey} />
                            ))}

                        {!isLoading &&
                            posts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onDelete={handleDeletePost}
                                        isDeleting={deletingPostId === post.id}
                                    />
                        ))}

                        {showEmptyState && (
                            <article className="rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-8 text-center text-sm text-on-surface-variant sm:px-5">
                                No publications found.
                            </article>
                        )}

                        {showErrorState && (
                            <article className="rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-8 text-center text-sm text-on-surface-variant sm:px-5">
                                {loadError}
                            </article>
                        )}

                        {showActionError && (
                            <article className="rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-8 text-center text-sm text-on-surface-variant sm:px-5">
                                {actionError}
                            </article>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 pb-6 text-xs text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        {isLoading
                            ? "Loading publications..."
                            : `Showing ${shownPostsCount} of ${pagination.total} publications`}
                    </span>

                    <nav className="flex items-center gap-2" aria-label="Pagination">
                        <button
                            type="button"
                            onClick={() => updatePageInUrl(currentPage - 1)}
                            disabled={isLoading || !pagination.hasPrev}
                            className="rounded-lg border border-outline-variant/30 bg-surface-container p-2 text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {pageNumbers.map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => updatePageInUrl(page)}
                                disabled={isLoading}
                                className={`h-9 w-9 rounded-lg border text-sm font-medium ${
                                    page === currentPage
                                        ? "border-primary-fixed bg-primary-fixed text-[#1b1f3b]"
                                        : "border-outline-variant/30 bg-surface-container text-on-surface-variant"
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => updatePageInUrl(currentPage + 1)}
                            disabled={isLoading || !pagination.hasNext}
                            className="rounded-lg border border-outline-variant/30 bg-surface-container p-2 text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Next page"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </nav>
                </div>
            </div>
        </section>
    );
}