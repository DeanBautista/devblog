import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import PostCard, { PostCardSkeleton } from "../../../components/posts/PostCard";
import SearchInputWithResults from "../../../components/search/SearchInputWithResults";
import SearchResultCard from "../../../components/search/SearchResultCard";
import usePostsData from "./hooks/usePostsData";
import { SKELETON_CARD_KEYS, FILTER_TABS } from "./constants";

export default function Posts() {
    const {
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
    } = usePostsData();

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
                            tags={post?.tags}
                            readTime={post?.reading_time}
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
                    <div className="hidden grid-cols-[84px_minmax(0,1.7fr)_112px_112px_112px_108px_70px] items-center gap-4 px-5 text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/80 xl:grid">
                        <span>Cover</span>
                        <span>Title</span>
                        <span>Status</span>
                        <span>Views</span>
                        <span>Likes</span>
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
