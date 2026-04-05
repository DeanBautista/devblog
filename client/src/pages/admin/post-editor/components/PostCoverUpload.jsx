export default function PostCoverUpload({
    fileInputRef,
    activeCoverPreview,
    onImageChange,
    isCoverUploading = false,
    coverUploadError = "",
}) {
    const handleCoverClick = () => {
        if (isCoverUploading) {
            return;
        }

        fileInputRef.current?.click();
    };

    return (
        <div className="mt-10">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImageChange}
                disabled={isCoverUploading}
            />
            <div
                onClick={handleCoverClick}
                className={`relative w-full rounded-xl overflow-hidden group ${
                    isCoverUploading ? "cursor-wait" : "cursor-pointer"
                }`}
            >
                {activeCoverPreview ? (
                    <>
                        <img
                            src={activeCoverPreview}
                            className="w-full h-full h-56 md:h-80 lg:h-105 object-cover rounded-xl"
                            alt="Cover preview"
                        />
                        <div
                            className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center rounded-xl ${
                                isCoverUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                        >
                            <div className="flex flex-col items-center gap-1.5 text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" x2="12" y1="3" y2="15" />
                                </svg>
                                <span className="text-xs font-medium">
                                    {isCoverUploading ? "Uploading image..." : "Replace"}
                                </span>
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
                            <span className="text-xs font-medium text-on-surface">
                                {isCoverUploading ? "Uploading image..." : "Add cover image"}
                            </span>
                            <span className="text-xs text-secondary">
                                {isCoverUploading
                                    ? "Please wait while your image is uploaded"
                                    : "Click to upload from your device"}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {coverUploadError ? (
                <p className="mt-2 text-xs text-error">{coverUploadError}</p>
            ) : null}
        </div>
    );
}
