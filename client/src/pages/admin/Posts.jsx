import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import PostCard, { PostCardSkeleton } from "../../components/posts/PostCard";
import api from "../../lib/axios";
import useAuthStore from "../../stores/authStore";

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

    console.log('Posts page, user:', user);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = normalizePageParam(searchParams.get("page"));

    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

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
                    },
                });

                if (shouldIgnore) {
                    return;
                }

                const responseBody = response.data ?? {};
                const rows = Array.isArray(responseBody.data) ? responseBody.data : [];
                const apiPagination = responseBody.pagination ?? {};
                const totalValue = Number.parseInt(apiPagination.total, 10);
                const totalPagesValue = Number.parseInt(apiPagination.totalPages, 10);
                const pageValue = normalizePageParam(apiPagination.page ?? currentPage);

                setPosts(rows.map((postRow, index) => mapPostForCard(postRow, index)));
                setPagination({
                    page: pageValue,
                    limit: POSTS_PER_PAGE,
                    total: Number.isFinite(totalValue) && totalValue > 0 ? totalValue : 0,
                    totalPages: Number.isFinite(totalPagesValue) && totalPagesValue > 0 ? totalPagesValue : 1,
                    hasPrev: pageValue > 1,
                    hasNext: Number.isFinite(totalPagesValue) ? pageValue < totalPagesValue : false,
                });
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
    }, [currentPage]);

    const pageNumbers = useMemo(
        () => Array.from({ length: pagination.totalPages }, (_, index) => index + 1),
        [pagination.totalPages]
    );

    const showEmptyState = !isLoading && posts.length === 0 && !loadError;
    const showErrorState = !isLoading && !!loadError;

    const updatePageInUrl = (nextPage) => {
        const boundedPage = Math.min(Math.max(nextPage, 1), pagination.totalPages);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("page", String(boundedPage));
        setSearchParams(nextParams);
    };

    return (
        <section className="min-h-screen w-full pt-14 md:pt-0">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <div className="relative w-full max-w-md">
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    />
                    <input
                        type="text"
                        readOnly
                        placeholder="Search posts..."
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface-container px-11 py-3 text-sm text-on-surface outline-none"
                    />
                </div>

                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">All Posts</h1>

                        <div className="mt-5 flex items-center gap-6 text-sm">
                            <button
                                type="button"
                                className="border-b border-primary-fixed pb-1 font-medium text-on-surface"
                            >
                                All
                            </button>
                            <button type="button" className="pb-1 text-on-surface-variant">
                                Published
                            </button>
                            <button type="button" className="pb-1 text-on-surface-variant">
                                Drafts
                            </button>
                        </div>
                    </div>

                    <Link
                        to="/newposts"
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
                            <PostCard key={post.id} post={post} />
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
                    </div>
                </div>

                <div className="flex flex-col gap-4 pb-6 text-xs text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        {isLoading
                            ? "Loading publications..."
                            : `Showing ${posts.length} of ${pagination.total} publications`}
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
