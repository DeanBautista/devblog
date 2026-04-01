export default function DeleteTagModal({
    tag,
    isDeleting,
    onCancel,
    onDelete,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" role="presentation">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-tag-title"
                className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface-container p-6 shadow-2xl"
            >
                <h4 id="delete-tag-title" className="text-lg font-semibold text-on-surface">
                    Delete tag?
                </h4>

                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    This will permanently remove &quot;{tag?.name}&quot; and detach it from all linked posts.
                </p>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="rounded-lg border border-outline-variant/40 px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
