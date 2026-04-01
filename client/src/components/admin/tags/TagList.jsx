import TagRow from "./TagRow";

const SKELETON_KEYS = Array.from({ length: 5 }, (_, index) => `tag-skeleton-${index}`);

function TagListSkeleton() {
    return (
        <div className="space-y-3" aria-hidden="true">
            {SKELETON_KEYS.map((skeletonKey) => (
                <article
                    key={skeletonKey}
                    className="animate-pulse rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-4 sm:px-5"
                >
                    <div className="h-5 w-40 rounded-md bg-surface-container" />
                    <div className="mt-2 h-4 w-24 rounded-md bg-surface-container" />
                </article>
            ))}
        </div>
    );
}

export default function TagList({
    tags,
    isLoading,
    loadError,
    actionError,
    expandedTagId,
    deletingTagId,
    updatingTagId,
    onToggleExpand,
    onRequestDelete,
    onUpdate,
    renderExpandedPanel,
}) {
    const showEmptyState = !isLoading && !loadError && tags.length < 1;

    return (
        <div className="space-y-3">
            {isLoading ? <TagListSkeleton /> : null}

            {!isLoading &&
                tags.map((tag) => (
                    <TagRow
                        key={tag.id}
                        tag={tag}
                        isExpanded={expandedTagId === tag.id}
                        isDeleting={deletingTagId === tag.id}
                        isUpdating={updatingTagId === tag.id}
                        onToggleExpand={onToggleExpand}
                        onRequestDelete={onRequestDelete}
                        onUpdate={onUpdate}
                    >
                        {renderExpandedPanel(tag)}
                    </TagRow>
                ))}

            {!isLoading && loadError ? (
                <article className="rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-8 text-center text-sm text-on-surface-variant sm:px-5">
                    {loadError}
                </article>
            ) : null}

            {!isLoading && actionError ? (
                <article className="rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-8 text-center text-sm text-on-surface-variant sm:px-5">
                    {actionError}
                </article>
            ) : null}

            {showEmptyState ? (
                <article className="rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-8 text-center text-sm text-on-surface-variant sm:px-5">
                    No tags found.
                </article>
            ) : null}
        </div>
    );
}
