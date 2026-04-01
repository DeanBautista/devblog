export default function TagForm({
    name,
    slug,
    isSubmitting,
    errorMessage,
    onNameChange,
    onSlugChange,
    onSubmit,
}) {
    return (
        <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 p-4 sm:p-5"
        >
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-on-surface">Create New Tag</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                        Add a descriptive name and clean slug for consistent tagging.
                    </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
                        Tag Name
                        <input
                            type="text"
                            value={name}
                            onChange={onNameChange}
                            placeholder="JavaScript"
                            maxLength={50}
                            className="rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none transition-colors focus:border-primary-fixed"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
                        Tag Slug
                        <input
                            type="text"
                            value={slug}
                            onChange={onSlugChange}
                            placeholder="javascript"
                            maxLength={50}
                            className="rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none transition-colors focus:border-primary-fixed"
                        />
                    </label>
                </div>

                {errorMessage ? (
                    <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                        {errorMessage}
                    </p>
                ) : null}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-full bg-primary-fixed px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Creating..." : "Create Tag"}
                    </button>
                </div>
            </div>
        </form>
    );
}
