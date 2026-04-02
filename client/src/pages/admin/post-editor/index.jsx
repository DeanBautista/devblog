import useAuthStore from "../../../stores/authStore";
import DocumentationEditor from "../../../components/editor/DocumentationEditor";
import { EDITOR_VIEWS } from "../../../components/document_renderer/postEditorConstants";
import usePostEditorForm from "./hooks/usePostEditorForm";
import PostEditorToolbar from "./components/PostEditorToolbar";
import PostMetadataForm from "./components/PostMetadataForm";
import PostTagSelector from "./components/PostTagSelector";
import PostCoverUpload from "./components/PostCoverUpload";
import PostPreviewSection from "./components/PostPreviewSection";
import {
    ExcerptModal,
    ValidationModal,
    ConfirmPublishModal,
    SuccessModal,
    ErrorModal,
} from "./components/PostEditorModals";

export default function PostEditor() {
    const { user } = useAuthStore();

    const {
        fileInputRef,
        titleTextareaRef,
        postTitle,
        postSlug,
        postExcerpt,
        editorContent,
        editorView,
        readTimeMinutes,
        selectedTagIds,
        setPostTitle,
        setPostSlug,
        setPostExcerpt,
        setEditorContent,
        setEditorView,
        isEditMode,
        isPostLoading,
        lastEditedDisplayLabel,
        hasPostTitle,
        activeCoverPreview,
        readTimeDisplayLabel,
        selectedTags,
        filteredTags,
        publishDateDisplayLabel,
        isExcerptModalOpen,
        setIsExcerptModalOpen,
        isValidationModalOpen,
        setIsValidationModalOpen,
        isConfirmPublishModalOpen,
        setIsConfirmPublishModalOpen,
        isSuccessModalOpen,
        isErrorModalOpen,
        setIsErrorModalOpen,
        isSubmitting,
        isCoverUploading,
        submitError,
        coverUploadError,
        successMessage,
        validationErrors,
        isTagsLoading,
        tagsLoadError,
        tagSearchTerm,
        setTagSearchTerm,
        handleImageChange,
        handleDraft,
        handlePublish,
        handleConfirmPublish,
        handleSuccessModalClose,
        handleReadTimeChange,
        handleToggleTagSelection,
        handleCloseExcerptModal,
    } = usePostEditorForm();

    return (
        <>
            <PostEditorToolbar
                editorView={editorView}
                setEditorView={setEditorView}
                onDraft={handleDraft}
                onPublish={handlePublish}
                isSubmitting={isSubmitting}
                isCoverUploading={isCoverUploading}
                isPostLoading={isPostLoading}
            />

            <main className="mt-10">
                <div>
                    <div>
                        {editorView === EDITOR_VIEWS.WRITE && (
                            <div className="ml-auto bg-surface-container rounded-full flex items-center w-fit px-4 py-1">
                                <span className="text-sm">{lastEditedDisplayLabel}</span>
                            </div>
                        )}

                        {editorView === EDITOR_VIEWS.WRITE && (
                            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm">Editor/Draft</span>
                                    <h1 className="text-3xl font-bold">{isEditMode ? "Edit Post" : "New Post"}</h1>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsExcerptModalOpen(true)}
                                    disabled={isPostLoading || isSubmitting || isCoverUploading}
                                    className="w-fit rounded-lg border border-outline-variant/40 bg-surface-container px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Post Excerpt
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-10">
                        {isEditMode && isPostLoading && (
                            <article className="rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-8 text-center text-sm text-on-surface-variant sm:px-5">
                                Loading post data...
                            </article>
                        )}

                        {!isPostLoading && editorView === EDITOR_VIEWS.WRITE ? (
                            <>
                                <PostMetadataForm
                                    postTitle={postTitle}
                                    setPostTitle={setPostTitle}
                                    postSlug={postSlug}
                                    setPostSlug={setPostSlug}
                                    readTimeMinutes={readTimeMinutes}
                                    onReadTimeChange={handleReadTimeChange}
                                    publishDateDisplayLabel={publishDateDisplayLabel}
                                    titleTextareaRef={titleTextareaRef}
                                />

                                <PostTagSelector
                                    selectedTagIds={selectedTagIds}
                                    selectedTags={selectedTags}
                                    filteredTags={filteredTags}
                                    isTagsLoading={isTagsLoading}
                                    tagsLoadError={tagsLoadError}
                                    tagSearchTerm={tagSearchTerm}
                                    setTagSearchTerm={setTagSearchTerm}
                                    onToggleTagSelection={handleToggleTagSelection}
                                />

                                <PostCoverUpload
                                    fileInputRef={fileInputRef}
                                    activeCoverPreview={activeCoverPreview}
                                    onImageChange={handleImageChange}
                                    isCoverUploading={isCoverUploading}
                                    coverUploadError={coverUploadError}
                                />
                            </>
                        ) : !isPostLoading ? (
                            <PostPreviewSection
                                user={user}
                                postTitle={postTitle}
                                hasPostTitle={hasPostTitle}
                                activeCoverPreview={activeCoverPreview}
                                selectedTags={selectedTags}
                                publishDateDisplayLabel={publishDateDisplayLabel}
                                readTimeDisplayLabel={readTimeDisplayLabel}
                                editorContent={editorContent}
                            />
                        ) : null}

                        {!isPostLoading && editorView === EDITOR_VIEWS.WRITE && (
                            <DocumentationEditor
                                value={editorContent}
                                onChangeValue={setEditorContent}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            {editorView === EDITOR_VIEWS.WRITE && isExcerptModalOpen && (
                <ExcerptModal
                    postExcerpt={postExcerpt}
                    setPostExcerpt={setPostExcerpt}
                    onClose={handleCloseExcerptModal}
                />
            )}

            {isValidationModalOpen && (
                <ValidationModal
                    validationErrors={validationErrors}
                    onClose={() => setIsValidationModalOpen(false)}
                />
            )}

            {isConfirmPublishModalOpen && (
                <ConfirmPublishModal
                    postTitle={postTitle}
                    isSubmitting={isSubmitting}
                    onCancel={() => setIsConfirmPublishModalOpen(false)}
                    onConfirm={handleConfirmPublish}
                />
            )}

            {isSuccessModalOpen && (
                <SuccessModal
                    message={successMessage}
                    onClose={handleSuccessModalClose}
                />
            )}

            {isErrorModalOpen && (
                <ErrorModal
                    message={submitError}
                    onClose={() => setIsErrorModalOpen(false)}
                />
            )}
        </>
    );
}
