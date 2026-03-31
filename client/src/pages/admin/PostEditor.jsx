import { useEffect, useMemo, useRef, useState } from "react";
import DocumentationEditor from "../../components/editor/DocumentationEditor";
import { CalendarIcon, ClockIcon } from "../../assets/svgs/Icons";
import { EDITOR_VIEWS } from "../../components/document_renderer/postEditorConstants";
import DocumentRenderer from "../../components/document_renderer/DocumentRenderer";
import useAuthStore from "../../stores/authStore";
import usePostEditorStore from "../../stores/postEditorStore";
import api from "../../lib/axios";

export default function PostEditor() {

    const { user } = useAuthStore();
    const postTitle = usePostEditorStore((state) => state.postTitle);
    const postSlug = usePostEditorStore((state) => state.postSlug);
    const postExcerpt = usePostEditorStore((state) => state.postExcerpt);
    const editorContent = usePostEditorStore((state) => state.editorContent);
    const editorView = usePostEditorStore((state) => state.editorView);
    const readTimeMinutes = usePostEditorStore((state) => state.readTimeMinutes);
    const setPostTitle = usePostEditorStore((state) => state.setPostTitle);
    const setPostSlug = usePostEditorStore((state) => state.setPostSlug);
    const setPostExcerpt = usePostEditorStore((state) => state.setPostExcerpt);
    const setEditorContent = usePostEditorStore((state) => state.setEditorContent);
    const setEditorView = usePostEditorStore((state) => state.setEditorView);
    const setReadTimeMinutes = usePostEditorStore((state) => state.setReadTimeMinutes);
    const resetDraft = usePostEditorStore((state) => state.resetDraft);

    const fileInputRef = useRef(null);
    const titleTextareaRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [isExcerptModalOpen, setIsExcerptModalOpen] = useState(false);
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
    const [isConfirmPublishModalOpen, setIsConfirmPublishModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [validationErrors, setValidationErrors] = useState([]);

    const hasPostTitle = postTitle.trim().length > 0;
    const activeCoverPreview = preview || null;
    const normalizedReadTimeMinutes = readTimeMinutes.trim();
    const readTimeDisplayLabel = `${normalizedReadTimeMinutes || "0"} min read`;
    const publishDateDisplayLabel = useMemo(() => {
        return new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }, []);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    useEffect(() => {
        if (titleTextareaRef.current) {
            titleTextareaRef.current.style.height = "auto";
            titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
        }
    }, [postTitle, editorView]);

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(file));
    };

    const normalizeSlug = (value) => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const getResolvedSlug = () => {
        return normalizeSlug(postSlug) || normalizeSlug(postTitle);
    };

    const resetFormState = () => {
        resetDraft();
        setPreview(null);
        setValidationErrors([]);
        setIsExcerptModalOpen(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePublish = () => {
        if (isSubmitting) return;

        const errors = [];
        if (!postTitle.trim()) errors.push("Post title");
        if (!postExcerpt.trim()) errors.push("Post excerpt");
        if (!normalizedReadTimeMinutes || normalizedReadTimeMinutes === "0") errors.push("Read time");
        if (!editorContent.trim()) errors.push("Main content");
        if (!getResolvedSlug()) errors.push("URL slug");

        if (errors.length > 0) {
            setValidationErrors(errors);
            setIsValidationModalOpen(true);
            return;
        }

        setSubmitError("");
        setIsConfirmPublishModalOpen(true);
    };

    const handleConfirmPublish = async () => {
        if (isSubmitting) return;

        const resolvedSlug = getResolvedSlug();

        if (!resolvedSlug) {
            setIsConfirmPublishModalOpen(false);
            setValidationErrors(["URL slug"]);
            setIsValidationModalOpen(true);
            return;
        }

        setIsConfirmPublishModalOpen(false);

        try {
            setIsSubmitting(true);
            setSubmitError("");

            const payload = {
                title: postTitle.trim(),
                slug: resolvedSlug,
                excerpt: postExcerpt.trim(),
                content: editorContent.trim(),
                reading_time: Number.parseInt(normalizedReadTimeMinutes, 10),
                cover_image: null,
            };

            const response = await api.post("/api/posts/submitpost", payload);

            resetFormState();
            setSuccessMessage(response.data?.message || "Post published successfully.");
            setIsSuccessModalOpen(true);
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Unable to publish post right now. Please try again.";

            setSubmitError(message);
            setIsErrorModalOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReadTimeChange = (event) => {
        const digitsOnly = event.target.value.replace(/\D/g, "");
        setReadTimeMinutes(digitsOnly);
    };

    const handleEditorViewChange = (nextView) => {
        setEditorView(nextView);
        if (nextView !== EDITOR_VIEWS.WRITE) {
            setIsExcerptModalOpen(false);
        }
    };

    const handleCloseExcerptModal = () => {
        setIsExcerptModalOpen(false);
    };

    return (
        <>
            <div className="w-full flex flex-col gap-4">
                <div className="w-full flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleEditorViewChange(EDITOR_VIEWS.WRITE)}
                        className={`flex-1 px-5 py-2 rounded-lg border transition-colors ${editorView === EDITOR_VIEWS.WRITE
                            ? "bg-primary-fixed border-primary-fixed text-black font-medium"
                            : "bg-surface-container border-outline-variant/40 text-on-surface hover:bg-surface-container-high"
                            }`}
                    >
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={() => handleEditorViewChange(EDITOR_VIEWS.PREVIEW)}
                        className={`flex-1 px-5 py-2 rounded-lg border transition-colors ${editorView === EDITOR_VIEWS.PREVIEW
                            ? "bg-primary-fixed border-primary-fixed text-black font-medium"
                            : "bg-surface-container border-outline-variant/40 text-on-surface hover:bg-surface-container-high"
                            }`}
                    >
                        Preview
                    </button>
                </div>

                {editorView === EDITOR_VIEWS.WRITE && (
                    <div className="w-full flex justify-end gap-4">
                        <button
                            type="button"
                            className="px-5 py-2 rounded-full border"
                            disabled={isSubmitting}
                        >
                            Draft
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={isSubmitting}
                            className={`text-black font-medium px-5 py-2 rounded-full bg-primary-fixed ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {isSubmitting ? "Publishing..." : "Publish"}
                        </button>
                    </div>
                )}
            </div>

            <main className="mt-10">
                <div>
                    <div>
                        {editorView === EDITOR_VIEWS.WRITE && (
                            <div className="ml-auto bg-surface-container rounded-full flex items-center w-fit px-4 py-1">
                                <span className="text-sm">Last edited 2m ago</span>
                            </div>
                        )}

                        {editorView === EDITOR_VIEWS.WRITE && (
                            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm">Editor/Draft</span>
                                    <h1 className="text-3xl font-bold">New Post</h1>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsExcerptModalOpen(true)}
                                    className="w-fit rounded-lg border border-outline-variant/40 bg-surface-container px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high"
                                >
                                    Post Excerpt
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-10">
                        {editorView === EDITOR_VIEWS.WRITE ? (
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
                                                onChange={handleReadTimeChange}
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
                        ) : null}

                        {editorView === EDITOR_VIEWS.WRITE ? (
                            <div className="mt-10">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-full rounded-xl overflow-hidden cursor-pointer group"
                                >
                                    {activeCoverPreview ? (
                                        <>
                                            <img
                                                src={activeCoverPreview}
                                                className="w-full h-56 md:h-80 lg:h-105 object-cover rounded-xl"
                                                alt="Cover preview"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                                <div className="flex flex-col items-center gap-1.5 text-white">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="17 8 12 3 7 8" />
                                                        <line x1="12" x2="12" y1="3" y2="15" />
                                                    </svg>
                                                    <span className="text-xs font-medium">Replace</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-40 border border-dashed border-outline-variant/50 rounded-xl flex flex-col items-center justify-center gap-3 text-secondary bg-surface-container/50 group-hover:bg-surface-container transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                                <circle cx="9" cy="9" r="2" />
                                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                            </svg>
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="text-xs font-medium text-on-surface">Add cover image</span>
                                                <span className="text-xs text-secondary">Click to upload from your device</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
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
                                </div>

                                <DocumentRenderer value={editorContent} />
                            </article>
                        )}

                        {editorView === EDITOR_VIEWS.WRITE ? (
                            <DocumentationEditor
                                value={editorContent}
                                onChangeValue={setEditorContent}
                            />
                        ) : null}
                    </div>
                </div>
            </main>

            {/* Excerpt Modal */}
            {editorView === EDITOR_VIEWS.WRITE && isExcerptModalOpen ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
                    onClick={handleCloseExcerptModal}
                >
                    <div
                        className="w-full max-w-2xl rounded-2xl border border-outline-variant/40 bg-surface px-5 py-5 shadow-2xl sm:px-6 sm:py-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold">Post Excerpt</h2>
                                <p className="mt-1 text-sm text-secondary">
                                    Add a short paragraph that summarizes your post.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="rounded-lg border border-outline-variant/40 px-3 py-1.5 text-sm text-secondary transition-colors hover:bg-surface-container"
                                onClick={handleCloseExcerptModal}
                            >
                                Close
                            </button>
                        </div>

                        <textarea
                            className="mt-5 min-h-32 w-full resize-y rounded-xl border border-outline-variant/40 bg-surface-container px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-primary-fixed"
                            placeholder="Write a compelling excerpt for readers..."
                            value={postExcerpt}
                            onChange={(event) => setPostExcerpt(event.target.value)}
                        />

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                className="rounded-full border border-outline-variant/40 px-5 py-2 text-sm text-on-surface transition-colors hover:bg-surface-container"
                                onClick={handleCloseExcerptModal}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Validation Modal */}
            {isValidationModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
                    onClick={() => setIsValidationModalOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface px-5 py-5 shadow-2xl sm:px-6 sm:py-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-error/10">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Missing required fields</h2>
                                <p className="mt-1 text-sm text-secondary">
                                    Please fill in the following before publishing:
                                </p>
                                <ul className="mt-3 flex flex-col gap-1.5">
                                    {validationErrors.map((error) => (
                                        <li key={error} className="flex items-center gap-2 text-sm">
                                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-error" />
                                            {error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                className="rounded-full bg-primary-fixed px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-80"
                                onClick={() => setIsValidationModalOpen(false)}
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Publish Modal */}
            {isConfirmPublishModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
                    onClick={() => setIsConfirmPublishModalOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface px-5 py-5 shadow-2xl sm:px-6 sm:py-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed/15">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-fixed">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Publish post?</h2>
                                <p className="mt-1 text-sm text-secondary">
                                    Are you sure you want to publish <span className="font-medium text-on-surface">"{postTitle}"</span>? It will be visible to everyone once published.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="rounded-full border border-outline-variant/40 px-5 py-2 text-sm text-on-surface transition-colors hover:bg-surface-container"
                                disabled={isSubmitting}
                                onClick={() => setIsConfirmPublishModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                className={`rounded-full bg-primary-fixed px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-80 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                                onClick={handleConfirmPublish}
                            >
                                {isSubmitting ? "Publishing..." : "Yes, publish"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
                    onClick={() => setIsSuccessModalOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface px-5 py-5 shadow-2xl sm:px-6 sm:py-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Post published</h2>
                                <p className="mt-1 text-sm text-secondary">{successMessage}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                className="rounded-full bg-primary-fixed px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-80"
                                onClick={() => setIsSuccessModalOpen(false)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Publish Error Modal */}
            {isErrorModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
                    onClick={() => setIsErrorModalOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface px-5 py-5 shadow-2xl sm:px-6 sm:py-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-error/10">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Publish failed</h2>
                                <p className="mt-1 text-sm text-secondary">{submitError}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                className="rounded-full bg-primary-fixed px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-80"
                                onClick={() => setIsErrorModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}