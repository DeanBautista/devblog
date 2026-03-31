import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware"; // 👈 import createJSONStorage
import { EDITOR_VIEWS } from "../components/document_renderer/postEditorConstants";

export const POST_EDITOR_DEFAULTS = {
    postTitle: "",
    postSlug: "",
    postExcerpt: "",
    editorContent: "",
    readTimeMinutes: "12",
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
            setReadTimeMinutes: (readTimeMinutes) => set({ readTimeMinutes }),
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
                readTimeMinutes: state.readTimeMinutes,
                editorView: state.editorView,
            }),
        }
    )
);

export default usePostEditorStore;