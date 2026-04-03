import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware"; // 👈 import createJSONStorage
import { EDITOR_VIEWS } from "../components/document_renderer/postEditorConstants";

export const POST_EDITOR_DEFAULTS = {
    postTitle: "",
    postSlug: "",
    postExcerpt: "",
    editorContent: "",
    coverImageUrl: null,
    hasUploadedCoverInSession: false,
    readTimeMinutes: "12",
    selectedTagIds: [],
    editorView: EDITOR_VIEWS.WRITE,
};

const usePostEditorStore = create(
    persist(
        (set) => ({
            ...POST_EDITOR_DEFAULTS,
            setPostTitle: (postTitle) => set({ postTitle }),
            setPostSlug: (postSlug) => set({ postSlug }),
            setPostExcerpt: (postExcerpt) => set({ postExcerpt }),
            setEditorContent: (editorContent) => set({ editorContent }),
            setCoverImageUrl: (coverImageUrl) =>
                set({
                    coverImageUrl:
                        typeof coverImageUrl === "string" && coverImageUrl.trim()
                            ? coverImageUrl.trim()
                            : null,
                }),
            setHasUploadedCoverInSession: (hasUploadedCoverInSession) =>
                set({ hasUploadedCoverInSession: Boolean(hasUploadedCoverInSession) }),
            setReadTimeMinutes: (readTimeMinutes) => set({ readTimeMinutes }),
            setSelectedTagIds: (selectedTagIds) => set({ selectedTagIds }),
            toggleSelectedTagId: (tagId) =>
                set((state) => {
                    const parsedTagId = Number.parseInt(tagId, 10);

                    if (!Number.isInteger(parsedTagId) || parsedTagId < 1) {
                        return state;
                    }

                    const isSelected = state.selectedTagIds.includes(parsedTagId);

                    if (isSelected) {
                        return {
                            selectedTagIds: state.selectedTagIds.filter((id) => id !== parsedTagId),
                        };
                    }

                    return {
                        selectedTagIds: [...state.selectedTagIds, parsedTagId],
                    };
                }),
            setEditorView: (editorView) => set({ editorView }),
            resetDraft: () => set({ ...POST_EDITOR_DEFAULTS }),
        }),
        {
            name: "post-editor-draft",
            storage: createJSONStorage(() => sessionStorage), // 👈 add this
            partialize: (state) => ({
                postTitle: state.postTitle,
                postSlug: state.postSlug,
                postExcerpt: state.postExcerpt,
                editorContent: state.editorContent,
                coverImageUrl: state.coverImageUrl,
                hasUploadedCoverInSession: state.hasUploadedCoverInSession,
                readTimeMinutes: state.readTimeMinutes,
                selectedTagIds: state.selectedTagIds,
                editorView: state.editorView,
            }),
        }
    )
);

export default usePostEditorStore;