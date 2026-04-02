export function ExcerptModal({ postExcerpt, setPostExcerpt, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
            onClick={onClose}
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
                        onClick={onClose}
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
                        onClick={onClose}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ValidationModal({ validationErrors, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
            onClick={onClose}
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
                        onClick={onClose}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ConfirmPublishModal({ postTitle, isSubmitting, onCancel, onConfirm }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
            onClick={onCancel}
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
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="rounded-full bg-primary-fixed px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-80"
                        disabled={isSubmitting}
                        onClick={onConfirm}
                    >
                        {isSubmitting ? "Publishing..." : "Publish"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function SuccessModal({ message, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface px-5 py-5 shadow-2xl sm:px-6 sm:py-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Success!</h2>
                        <p className="mt-1 text-sm text-secondary">{message}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        className="rounded-full bg-primary-fixed px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-80"
                        onClick={onClose}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ErrorModal({ message, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface px-5 py-5 shadow-2xl sm:px-6 sm:py-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-error/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Error</h2>
                        <p className="mt-1 text-sm text-secondary">{message}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        className="rounded-full bg-primary-fixed px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-80"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
