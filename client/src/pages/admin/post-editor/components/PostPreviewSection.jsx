import { CalendarIcon, ClockIcon } from "../../../../assets/svgs/Icons";
import DocumentRenderer from "../../../../components/document_renderer/DocumentRenderer";

export default function PostPreviewSection({
    user,
    postTitle,
    hasPostTitle,
    activeCoverPreview,
    selectedTags,
    publishDateDisplayLabel,
    readTimeDisplayLabel,
    editorContent,
}) {
    return (
        <article className="mt-10 flex flex-col">
            {activeCoverPreview ? (
                <div className="w-full h-56 md:h-80 lg:h-105 rounded-2xl overflow-hidden bg-on-tertiary">
                    <img src={activeCoverPreview} className="w-full h-full min-h-87.5 max-h-125 object-cover" alt="Cover preview" />
                </div>
            ) : (
                <div className="w-full h-56 md:h-80 lg:h-105 rounded-2xl bg-on-tertiary flex items-center justify-center text-secondary text-sm">
                    No cover image selected
                </div>
            )}

            <div className="mt-8 md:mt-10 flex flex-col gap-4">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight wrap-break-word">
                    {hasPostTitle ? postTitle : "Untitled Post"}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-3">
                        <img
                            src={user?.avatar_url}
                            alt={user?.name}
                            className="w-10 h-10 rounded-full object-cover bg-surface-container"
                        />
                        <span className="text-sm md:text-base font-medium text-on-surface">
                            {user?.name}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-secondary">
                        <span className="flex items-center gap-1.5">
                            <CalendarIcon className="w-4 h-4" />
                            {publishDateDisplayLabel}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4" />
                            {readTimeDisplayLabel}
                        </span>
                    </div>
                </div>

                {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                            <span
                                key={`preview-tag-${tag.id}`}
                                className="rounded-full border border-outline-variant/40 bg-surface-container px-3 py-1 text-xs font-medium text-on-surface-variant"
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <DocumentRenderer value={editorContent} />
        </article>
    );
}
