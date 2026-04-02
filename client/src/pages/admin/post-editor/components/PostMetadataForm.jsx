import { CalendarIcon, ClockIcon } from "../../../../assets/svgs/Icons";

export default function PostMetadataForm({
    postTitle,
    setPostTitle,
    postSlug,
    setPostSlug,
    readTimeMinutes,
    onReadTimeChange,
    publishDateDisplayLabel,
    titleTextareaRef,
}) {
    return (
        <div>
            <textarea
                ref={titleTextareaRef}
                className="w-full outline-none text-4xl font-medium resize-none overflow-hidden leading-tight bg-transparent"
                placeholder="Post title..."
                rows={1}
                value={postTitle}
                onChange={(event) => {
                    setPostTitle(event.target.value);
                    event.target.style.height = "auto";
                    event.target.style.height = `${event.target.scrollHeight}px`;
                }}
            />

            <div className="mt-10 flex flex-col gap-3 lg:w-full lg:flex-row">
                <div className="w-full bg-surface-container px-3 py-2 rounded-lg flex gap-1 items-center">
                    <span className="text-sm text-secondary">obsidian.io/blog/</span>
                    <input
                        type="text"
                        placeholder="your-post-slug"
                        className="w-full outline-none text-sm"
                        value={postSlug}
                        onChange={(event) => setPostSlug(event.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <label className="whitespace-nowrap text-sm px-4 py-2 bg-on-tertiary rounded-lg flex items-center min-w-0">
                        <ClockIcon className="text-secondary shrink-0 mr-2" />
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="w-10 bg-transparent outline-none text-sm max-w-3.75 mr-1"
                            value={readTimeMinutes}
                            onChange={onReadTimeChange}
                            aria-label="Minutes to read"
                        />
                        <span className="text-secondary">min read</span>
                    </label>

                    <label className="whitespace-nowrap text-sm px-4 py-2 bg-on-tertiary rounded-lg flex items-center gap-2 min-w-0">
                        <CalendarIcon className="text-secondary shrink-0" />
                        <span className="text-secondary">{publishDateDisplayLabel}</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
