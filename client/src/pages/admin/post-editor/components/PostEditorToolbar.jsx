import { EDITOR_VIEWS } from "../../../../components/document_renderer/postEditorConstants";

export default function PostEditorToolbar({
    editorView,
    setEditorView,
    onDraft,
    onPublish,
    isSubmitting,
    isCoverUploading = false,
    isPostLoading = false,
}) {
    const isActionDisabled = isSubmitting || isPostLoading || isCoverUploading;

    const handleEditorViewChange = (nextView) => {
        if (isPostLoading) {
            return;
        }

        setEditorView(nextView);
    };

    return (
        <div className="sticky top-0 z-40 w-full flex flex-col gap-4 bg-background py-4">
            <div className="w-full flex gap-2">
                <button
                    type="button"
                    onClick={() => handleEditorViewChange(EDITOR_VIEWS.WRITE)}
                    disabled={isPostLoading}
                    className={`flex-1 px-5 py-2 rounded-lg border transition-colors ${
                        editorView === EDITOR_VIEWS.WRITE
                            ? "bg-primary-fixed border-primary-fixed text-black font-medium"
                            : "bg-surface-container border-outline-variant/40 text-on-surface hover:bg-surface-container-high"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                    Write
                </button>
                <button
                    type="button"
                    onClick={() => handleEditorViewChange(EDITOR_VIEWS.PREVIEW)}
                    disabled={isPostLoading}
                    className={`flex-1 px-5 py-2 rounded-lg border transition-colors ${
                        editorView === EDITOR_VIEWS.PREVIEW
                            ? "bg-primary-fixed border-primary-fixed text-black font-medium"
                            : "bg-surface-container border-outline-variant/40 text-on-surface hover:bg-surface-container-high"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                    Preview
                </button>
            </div>

            {editorView === EDITOR_VIEWS.WRITE && (
                <div className="w-full flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onDraft}
                        className="px-5 py-2 rounded-full border"
                        disabled={isActionDisabled}
                    >
                        {isPostLoading ? "Loading..." : isCoverUploading ? "Uploading cover..." : "Draft"}
                    </button>
                    <button
                        onClick={onPublish}
                        disabled={isActionDisabled}
                        className={`text-black font-medium px-5 py-2 rounded-full bg-primary-fixed ${
                            isActionDisabled ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                    >
                        {isPostLoading
                            ? "Loading..."
                            : isCoverUploading
                            ? "Uploading cover..."
                            : isSubmitting
                            ? "Publishing..."
                            : "Publish"}
                    </button>
                </div>
            )}
        </div>
    );
}
