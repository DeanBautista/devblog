import { ChevronLeft, ChevronRight, Search, Tags as TagsIcon } from 'lucide-react';
import TagForm from '../../../components/admin/tags/TagForm';
import TagList from '../../../components/admin/tags/TagList';
import TagPostsPanel from '../../../components/admin/tags/TagPostsPanel';
import DeleteTagModal from '../../../components/admin/tags/DeleteTagModal';
import { createTagPostsState } from './constants';
import useTagsData from './hooks/useTagsData';

export default function Tags() {
    const {
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
    } = useTagsData();

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
                            onChange={handleSearchChange}
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
                                    ? 'Loading tags...'
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
                    <span>{debouncedSearchTerm ? `Filter: ${debouncedSearchTerm}` : 'All tags'}</span>

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
                                        ? 'border-primary-fixed bg-primary-fixed text-[#1b1f3b]'
                                        : 'border-outline-variant/30 bg-surface-container text-on-surface-variant'
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
