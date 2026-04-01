import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Save, Trash2, X } from "lucide-react";
import { normalizeSlug } from "../../../utils/slug";

export default function TagRow({
    tag,
    isExpanded,
    isUpdating,
    isDeleting,
    onToggleExpand,
    onRequestDelete,
    onUpdate,
    children,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [nameValue, setNameValue] = useState(tag.name);
    const [slugValue, setSlugValue] = useState(tag.slug);
    const [isSlugDirty, setIsSlugDirty] = useState(false);

    const handleStartEdit = () => {
        if (isUpdating || isDeleting) {
            return;
        }

        setNameValue(tag.name);
        setSlugValue(tag.slug);
        setIsSlugDirty(false);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        if (isUpdating) {
            return;
        }

        setNameValue(tag.name);
        setSlugValue(tag.slug);
        setIsSlugDirty(false);
        setIsEditing(false);
    };

    const handleNameChange = (event) => {
        const nextName = event.target.value;
        setNameValue(nextName);

        if (!isSlugDirty) {
            setSlugValue(normalizeSlug(nextName));
        }
    };

    const handleSlugChange = (event) => {
        setIsSlugDirty(true);
        setSlugValue(normalizeSlug(event.target.value));
    };

    const handleSave = async () => {
        const isUpdated = await onUpdate(tag.id, {
            name: nameValue,
            slug: slugValue,
        });

        if (isUpdated) {
            setIsEditing(false);
        }
    };

    return (
        <article className="rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                    {isEditing ? (
                        <div className="grid gap-2 md:grid-cols-2">
                            <input
                                type="text"
                                value={nameValue}
                                onChange={handleNameChange}
                                maxLength={50}
                                className="rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none transition-colors focus:border-primary-fixed"
                                placeholder="Tag name"
                            />
                            <input
                                type="text"
                                value={slugValue}
                                onChange={handleSlugChange}
                                maxLength={50}
                                className="rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none transition-colors focus:border-primary-fixed"
                                placeholder="Tag slug"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-semibold text-on-surface">{tag.name}</h3>
                                <span className="rounded-full border border-outline-variant/40 bg-surface-container px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                                    {tag.usage_count} posts
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-on-surface-variant">/{tag.slug}</p>
                        </>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={isUpdating}
                                className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant/30 px-3 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <X size={14} />
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="inline-flex items-center gap-1.5 rounded-md bg-primary-fixed px-3 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save size={14} />
                                {isUpdating ? "Saving..." : "Save"}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => onToggleExpand(tag.id)}
                                className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant/30 px-3 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
                            >
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {isExpanded ? "Hide posts" : "Show posts"}
                            </button>
                            <button
                                type="button"
                                onClick={handleStartEdit}
                                disabled={isDeleting || isUpdating}
                                className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant/30 px-3 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Pencil size={14} />
                                Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => onRequestDelete(tag)}
                                disabled={isDeleting || isUpdating}
                                className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant/30 px-3 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Trash2 size={14} />
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isExpanded ? <div className="mt-4">{children}</div> : null}
        </article>
    );
}
