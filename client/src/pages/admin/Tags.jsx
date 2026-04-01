import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Tags as TagsIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import {
    createAdminTag,
    deleteAdminTag,
    getAdminTagPosts,
    getAdminTags,
    updateAdminTag,
} from "../../lib/tags";
import TagForm from "../../components/admin/tags/TagForm";
import TagList from "../../components/admin/tags/TagList";
import TagPostsPanel from "../../components/admin/tags/TagPostsPanel";
import DeleteTagModal from "../../components/admin/tags/DeleteTagModal";
import { normalizeSlug } from "../../utils/slug";

const TAGS_PER_PAGE = 8;
const TAG_POSTS_PER_PAGE = 5;

const DEFAULT_PAGINATION = {
    page: 1,
    limit: TAGS_PER_PAGE,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
};

function createTagPostsState() {
    return {
        posts: [],
        isLoading: false,
        isLoaded: false,
        errorMessage: "",
        pagination: {
            page: 1,
            limit: TAG_POSTS_PER_PAGE,
            total: 0,
            totalPages: 1,
            hasPrev: false,
            hasNext: false,
        },
    };
}

function normalizePageParam(pageParam) {
    const parsedValue = Number.parseInt(pageParam ?? "1", 10);

    if (!Number.isFinite(parsedValue) || parsedValue < 1) {
        return 1;
    }

    return parsedValue;
}

function mapTagRow(tagRow) {
    const parsedId = Number.parseInt(tagRow?.id, 10);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
        return null;
    }

    return {
        id: parsedId,
        name: String(tagRow?.name ?? "").trim(),
        slug: String(tagRow?.slug ?? "").trim(),
        usage_count: Number.parseInt(tagRow?.usage_count, 10) || 0,
    };
}

function mapTagPost(postRow) {
    const parsedId = Number.parseInt(postRow?.id, 10);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
        return null;
    }

    return {
        id: parsedId,
        title: String(postRow?.title ?? "Untitled Post").trim() || "Untitled Post",
        slug: String(postRow?.slug ?? ""),
        status: String(postRow?.status ?? "draft"),
        reading_time: Number.parseInt(postRow?.reading_time, 10) || 0,
        views: Number.parseInt(postRow?.views, 10) || 0,
        published_at: postRow?.published_at ?? null,
        created_at: postRow?.created_at ?? null,
    };
}

export default function Tags() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = normalizePageParam(searchParams.get("page"));

    const [tags, setTags] = useState([]);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [actionError, setActionError] = useState("");
    const [refreshNonce, setRefreshNonce] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const normalizedSearchTerm = searchTerm.trim();
    const debouncedSearchTerm = useDebouncedValue(normalizedSearchTerm, 350);

    const [createName, setCreateName] = useState("");
    const [createSlug, setCreateSlug] = useState("");
    const [isCreateSlugDirty, setIsCreateSlugDirty] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState("");

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

    const updatePageInUrl = (nextPage) => {
        const safeMaxPage = Math.max(1, pagination.totalPages);
        const boundedPage = Math.min(Math.max(nextPage, 1), safeMaxPage);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("page", String(boundedPage));
        setSearchParams(nextParams);
    };

    const applyTagsResponse = (responseBody, fallbackPage) => {
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
    };

    const loadTagPosts = async (tagId, page = 1) => {
        setTagPostsById((previousState) => {
            const currentTagState = previousState[tagId] ?? createTagPostsState();

            return {
                ...previousState,
                [tagId]: {
                    ...currentTagState,
                    isLoading: true,
                    errorMessage: "",
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
                    errorMessage: "",
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
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Unable to load posts for this tag.";

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
    };

    useEffect(() => {
        let shouldIgnore = false;

        const loadTags = async () => {
            setIsLoading(true);
            setLoadError("");

            try {
                const response = await getAdminTags({
                    page: currentPage,
                    limit: TAGS_PER_PAGE,
                    q: debouncedSearchTerm,
                });

                if (shouldIgnore) {
                    return;
                }

                applyTagsResponse(response ?? {}, currentPage);
            } catch (error) {
                if (shouldIgnore) {
                    return;
                }

                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    "Unable to load tags right now.";

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
        };

        loadTags();

        return () => {
            shouldIgnore = true;
        };
    }, [currentPage, debouncedSearchTerm, refreshNonce]);

    const handleCreateNameChange = (event) => {
        const nextName = event.target.value;
        setCreateName(nextName);

        if (!isCreateSlugDirty) {
            setCreateSlug(normalizeSlug(nextName));
        }
    };

    const handleCreateSlugChange = (event) => {
        setIsCreateSlugDirty(true);
        setCreateSlug(normalizeSlug(event.target.value));
    };

    const handleCreateTag = async (event) => {
        event.preventDefault();

        const normalizedName = createName.trim();
        const normalizedSlug = normalizeSlug(createSlug) || normalizeSlug(normalizedName);

        if (!normalizedName || !normalizedSlug) {
            setCreateError("Tag name and slug are required.");
            return;
        }

        setCreateError("");
        setActionError("");
        setIsCreating(true);

        try {
            await createAdminTag({
                name: normalizedName,
                slug: normalizedSlug,
            });

            setCreateName("");
            setCreateSlug("");
            setIsCreateSlugDirty(false);

            if (currentPage !== 1) {
                updatePageInUrl(1);
            } else {
                setRefreshNonce((previous) => previous + 1);
            }
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Unable to create tag right now.";

            setCreateError(message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateTag = async (tagId, values) => {
        const normalizedName = String(values?.name ?? "").trim();
        const normalizedSlug = normalizeSlug(values?.slug) || normalizeSlug(normalizedName);

        if (!normalizedName || !normalizedSlug) {
            setActionError("Tag name and slug are required.");
            return false;
        }

        setActionError("");
        setUpdatingTagId(tagId);

        try {
            await updateAdminTag(tagId, {
                name: normalizedName,
                slug: normalizedSlug,
            });

            setRefreshNonce((previous) => previous + 1);
            return true;
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Unable to update tag right now.";

            setActionError(message);
            return false;
        } finally {
            setUpdatingTagId(null);
        }
    };

    const handleRequestDelete = (tag) => {
        setPendingDeleteTag(tag);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDeleteTag?.id) {
            return;
        }

        const tagId = Number.parseInt(pendingDeleteTag.id, 10);
        if (!Number.isInteger(tagId) || tagId < 1) {
            return;
        }

        const isDeletingLastTagOnPage = tags.length === 1;

        setActionError("");
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
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Unable to delete tag right now.";

            setActionError(message);
        } finally {
            setDeletingTagId(null);
        }
    };

    const handleToggleExpand = (tagId) => {
        const shouldExpand = expandedTagId !== tagId;
        setExpandedTagId(shouldExpand ? tagId : null);

        if (!shouldExpand) {
            return;
        }

        const currentState = tagPostsById[tagId];
        if (!currentState || !currentState.isLoaded) {
            loadTagPosts(tagId, 1);
        }
    };

    return (
        <section className="min-h-screen w-full pt-14 md:pt-0">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">
                            Tags
                        </h1>
                        <p className="mt-2 text-sm text-on-surface-variant">
                            Manage your taxonomy and quickly inspect which posts are using each tag.
                        </p>
                    </div>

                    <label className="inline-flex w-full max-w-sm items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-3 py-2 text-on-surface-variant">
                        <Search size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                if (currentPage !== 1) {
                                    const nextParams = new URLSearchParams(searchParams);
                                    nextParams.set("page", "1");
                                    setSearchParams(nextParams);
                                }
                            }}
                            placeholder="Search tags by name or slug..."
                            className="w-full bg-transparent text-sm text-on-surface outline-none"
                        />
                    </label>
                </div>

                <TagForm
                    name={createName}
                    slug={createSlug}
                    isSubmitting={isCreating}
                    errorMessage={createError}
                    onNameChange={handleCreateNameChange}
                    onSlugChange={handleCreateSlugChange}
                    onSubmit={handleCreateTag}
                />

                <div>
                    <div className="mb-3 flex items-center justify-between gap-3 px-1">
                        <div className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
                            <TagsIcon size={16} />
                            <span>
                                {isLoading
                                    ? "Loading tags..."
                                    : `Showing ${shownTagsCount} of ${pagination.total} tags`}
                            </span>
                        </div>
                    </div>

                    <TagList
                        tags={tags}
                        isLoading={isLoading}
                        loadError={loadError}
                        actionError={actionError}
                        expandedTagId={expandedTagId}
                        deletingTagId={deletingTagId}
                        updatingTagId={updatingTagId}
                        onToggleExpand={handleToggleExpand}
                        onRequestDelete={handleRequestDelete}
                        onUpdate={handleUpdateTag}
                        renderExpandedPanel={(tag) => {
                            const tagPostsState = tagPostsById[tag.id] ?? createTagPostsState();

                            return (
                                <TagPostsPanel
                                    posts={tagPostsState.posts}
                                    pagination={tagPostsState.pagination}
                                    isLoading={tagPostsState.isLoading}
                                    errorMessage={tagPostsState.errorMessage}
                                    onPageChange={(nextPage) => loadTagPosts(tag.id, nextPage)}
                                />
                            );
                        }}
                    />
                </div>

                <div className="flex flex-col gap-4 pb-6 text-xs text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
                    <span>{debouncedSearchTerm ? `Filter: ${debouncedSearchTerm}` : "All tags"}</span>

                    <nav className="flex items-center gap-2" aria-label="Tags pagination">
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
                                key={`tags-page-${page}`}
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

            {pendingDeleteTag ? (
                <DeleteTagModal
                    tag={pendingDeleteTag}
                    isDeleting={deletingTagId === Number.parseInt(pendingDeleteTag.id, 10)}
                    onCancel={() => setPendingDeleteTag(null)}
                    onDelete={handleConfirmDelete}
                />
            ) : null}
        </section>
    );
}
