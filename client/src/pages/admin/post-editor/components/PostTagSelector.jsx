import { MIN_POST_TAGS, MAX_POST_TAGS } from "../constants";

export default function PostTagSelector({
    selectedTagIds,
    selectedTags,
    filteredTags,
    isTagsLoading,
    tagsLoadError,
    tagSearchTerm,
    setTagSearchTerm,
    onToggleTagSelection,
}) {
    return (
        <section className="mt-6 rounded-xl border border-outline-variant/30 bg-surface-container-low/60 p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-on-surface">Post Tags</h2>
                    <p className="mt-1 text-xs text-on-surface-variant">
                        Select {MIN_POST_TAGS} to {MAX_POST_TAGS} tags to improve categorization.
                    </p>
                </div>

                <span className="w-fit rounded-full border border-outline-variant/40 bg-surface-container px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                    {selectedTagIds.length} selected
                </span>
            </div>

            {selectedTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                        <button
                            key={`selected-tag-${tag.id}`}
                            type="button"
                            onClick={() => onToggleTagSelection(tag.id)}
                            className="rounded-full border border-primary-fixed/40 bg-primary-fixed/15 px-3 py-1 text-xs font-medium text-on-surface transition-colors hover:bg-primary-fixed/25"
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-4">
                <input
                    type="text"
                    value={tagSearchTerm}
                    onChange={(event) => setTagSearchTerm(event.target.value)}
                    placeholder="Search available tags..."
                    className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none transition-colors focus:border-primary-fixed"
                />
            </div>

            {isTagsLoading && (
                <p className="mt-3 text-xs text-on-surface-variant">Loading tags...</p>
            )}

            {!isTagsLoading && tagsLoadError && (
                <p className="mt-3 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                    {tagsLoadError}
                </p>
            )}

            {!isTagsLoading && !tagsLoadError && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {filteredTags.length > 0 ? (
                        filteredTags.map((tag) => {
                            const isSelected = selectedTagIds.includes(tag.id);

                            return (
                                <button
                                    key={`available-tag-${tag.id}`}
                                    type="button"
                                    onClick={() => onToggleTagSelection(tag.id)}
                                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                        isSelected
                                            ? "border-primary-fixed bg-primary-fixed text-black"
                                            : "border-outline-variant/40 bg-surface-container text-on-surface-variant hover:text-on-surface"
                                    }`}
                                >
                                    {tag.name}
                                </button>
                            );
                        })
                    ) : (
                        <span className="text-xs text-on-surface-variant">
                            No tags match your search.
                        </span>
                    )}
                </div>
            )}
        </section>
    );
}
