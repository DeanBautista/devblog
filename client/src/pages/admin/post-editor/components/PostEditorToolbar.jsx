import { EDITOR_VIEWS } from "../../../../components/document_renderer/postEditorConstants";

export default function PostEditorToolbar({ editorView, setEditorView, onDraft, onPublish, isSubmitting }) {
    const handleEditorViewChange = (nextView) => {
        setEditorView(nextView);
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="w-full flex gap-2">
                <button
                    type="button"
                    onClick={() => handleEditorViewChange(EDITOR_VIEWS.WRITE)}
                    className={`flex-1 px-5 py-2 rounded-lg border transition-colors ${
                        editorView === EDITOR_VIEWS.WRITE
                            ? "bg-primary-fixed border-primary-fixed text-black font-medium"
                            : "bg-surface-container border-outline-variant/40 text-on-surface hover:bg-surface-container-high"
                    }`}
                >
                    Write
                </button>
                <button
                    type="button"
                    onClick={() => handleEditorViewChange(EDITOR_VIEWS.PREVIEW)}
                    className={`flex-1 px-5 py-2 rounded-lg border transition-colors ${
                        editorView === EDITOR_VIEWS.PREVIEW
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
                        onClick={onDraft}
                        className="px-5 py-2 rounded-full border"
                        disabled={isSubmitting}
                    >
                        Draft
                    </button>
                    <button
                        onClick={onPublish}
                        disabled={isSubmitting}
                        className={`text-black font-medium px-5 py-2 rounded-full bg-primary-fixed ${
                            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                    >
                        {isSubmitting ? "Publishing..." : "Publish"}
                    </button>
                </div>
            )}
        </div>
    );
}
