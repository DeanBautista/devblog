import { ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_STYLES = {
    published: "border border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
    draft: "border border-amber-300/25 bg-amber-400/10 text-amber-200",
};

function mapStatus(statusValue) {
    const normalized = String(statusValue ?? "").trim().toLowerCase();
    return normalized === "published" ? "published" : "draft";
}

function formatDate(dateValue) {
    const parsedDate = new Date(dateValue ?? "");

    if (Number.isNaN(parsedDate.getTime())) {
        return "N/A";
    }

    return parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function TagPostsPanel({
    posts,
    pagination,
    isLoading,
    errorMessage,
    onPageChange,
}) {
    const page = pagination?.page ?? 1;
    const totalPages = pagination?.totalPages ?? 1;
    const hasPrev = pagination?.hasPrev ?? false;
    const hasNext = pagination?.hasNext ?? false;
    const total = pagination?.total ?? 0;

    return (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low/40 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="text-sm font-medium text-on-surface">Posts Using This Tag</h4>
                <span className="text-xs text-on-surface-variant">{total} linked</span>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 3 }, (_, index) => (
                        <div
                            key={`tag-posts-loading-${index}`}
                            className="h-12 animate-pulse rounded-lg bg-surface-container"
                        />
                    ))}
                </div>
            ) : null}

            {!isLoading && errorMessage ? (
                <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                    {errorMessage}
                </p>
            ) : null}

            {!isLoading && !errorMessage && posts.length === 0 ? (
                <p className="rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 text-sm text-on-surface-variant">
                    No posts are linked to this tag yet.
                </p>
            ) : null}

            {!isLoading && !errorMessage && posts.length > 0 ? (
                <>
                    <div className="space-y-2">
                        {posts.map((post) => {
                            const normalizedStatus = mapStatus(post.status);
                            const statusClass = STATUS_STYLES[normalizedStatus] ?? STATUS_STYLES.draft;

                            return (
                                <div
                                    key={`tag-post-${post.id}`}
                                    className="rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h5 className="text-sm font-medium text-on-surface">{post.title}</h5>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${statusClass}`}>
                                            {normalizedStatus}
                                        </span>
                                    </div>

                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                                        <span>{post.reading_time || 0} min read</span>
                                        <span>{Number(post.views || 0).toLocaleString()} views</span>
                                        <span>{formatDate(post.published_at ?? post.created_at)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            disabled={!hasPrev || isLoading}
                            onClick={() => onPageChange(page - 1)}
                            className="rounded-lg border border-outline-variant/30 bg-surface-container p-2 text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        <span className="text-xs text-on-surface-variant">
                            Page {page} of {Math.max(totalPages, 1)}
                        </span>

                        <button
                            type="button"
                            disabled={!hasNext || isLoading}
                            onClick={() => onPageChange(page + 1)}
                            className="rounded-lg border border-outline-variant/30 bg-surface-container p-2 text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Next page"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </>
            ) : null}
        </div>
    );
}
