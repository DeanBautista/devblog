import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, FilePlus, Tag, User, Settings, LogOut, Menu, X } from "lucide-react";
import useAuthStore from "../stores/authStore";
import usePostEditorStore, { POST_EDITOR_DEFAULTS } from "../stores/postEditorStore";

const RELOAD_DRAFT_RESET_FLAG_KEY = "post-editor-clear-on-reload";
const POST_EDITOR_DRAFT_STORAGE_KEY = "post-editor-draft";

export default function SideBar({ children, page }) {

  const { logout, user } = useAuthStore();
  const postTitle = usePostEditorStore((state) => state.postTitle);
  const postSlug = usePostEditorStore((state) => state.postSlug);
  const postExcerpt = usePostEditorStore((state) => state.postExcerpt);
  const editorContent = usePostEditorStore((state) => state.editorContent);
  const readTimeMinutes = usePostEditorStore((state) => state.readTimeMinutes);
  const selectedTagIds = usePostEditorStore((state) => state.selectedTagIds);

  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const hasUnsavedCreateDraft =
    postTitle.trim().length > 0 ||
    postSlug.trim().length > 0 ||
    postExcerpt.trim().length > 0 ||
    editorContent.trim().length > 0 ||
    readTimeMinutes.trim() !== POST_EDITOR_DEFAULTS.readTimeMinutes ||
    selectedTagIds.length > 0;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hasUnsavedCreateDraft) {
      return;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "You have unsaved changes in New Post. Are you sure you want to leave?";
    };

    const handlePageHide = () => {
      sessionStorage.setItem(RELOAD_DRAFT_RESET_FLAG_KEY, "1");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [hasUnsavedCreateDraft]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const shouldClearDraft = sessionStorage.getItem(RELOAD_DRAFT_RESET_FLAG_KEY) === "1";

    if (!shouldClearDraft) {
      return;
    }

    const navigationEntry = window.performance.getEntriesByType("navigation")?.[0];
    const isReloadNavigation = navigationEntry?.type === "reload";

    if (isReloadNavigation) {
      sessionStorage.removeItem(POST_EDITOR_DRAFT_STORAGE_KEY);
      usePostEditorStore.getState().resetDraft();
    }

    sessionStorage.removeItem(RELOAD_DRAFT_RESET_FLAG_KEY);
  }, []);

  const handleLogout = () => {
    if (hasUnsavedCreateDraft) {
      const shouldSignOut = window.confirm(
        "You have unsaved changes in New Post. Are you sure you want to sign out?"
      );

      if (!shouldSignOut) {
        return;
      }
    }

    sessionStorage.removeItem(RELOAD_DRAFT_RESET_FLAG_KEY);
    sessionStorage.removeItem(POST_EDITOR_DRAFT_STORAGE_KEY);
    usePostEditorStore.getState().resetDraft();
    logout();
  };

  return (
    <div className="">
      {/* Backdrop — mobile only */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed flex flex-col justify-between top-0 bottom-0 w-65 bg-surface-container px-5 py-5 z-40 transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* top section */}
        <div>
          <div className="flex items-center justify-between py-4 mb-5">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-medium">BlogCMS</h1>
              <span className="text-on-surface-variant">Admin Panel</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-on-surface-variant hover:text-white transition-colors p-1 rounded-md"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span 
                onClick={() => {navigate("/admin/dashboard")}}
                className={`flex items-center gap-3 text-lg px-3 py-4 rounded-lg w-full cursor-pointer
                ${page === "dashboard" ? "bg-indigo-500/10 border-r-4 border-r-primary text-on-primary-container" : "text-on-surface-variant"}`}
            >
              <LayoutDashboard size={20} className="text-white shrink-0" />
              Dashboard
            </span>
            <span 
                onClick={() => {navigate("/admin/posts")}}
                className={`flex items-center gap-3 text-lg px-3 py-4 rounded-lg w-full cursor-pointer
                ${page === "posts" ? "bg-indigo-500/10 border-r-4 border-r-primary text-on-primary-container" : "text-on-surface-variant"}`}
            >
              <FileText size={20} className="text-white shrink-0" />
              Posts
            </span>
            <span 
                onClick={() => {navigate("/admin/newposts")}}
                className={`flex items-center gap-3 text-lg px-3 py-4 rounded-lg w-full cursor-pointer
                ${page === "newposts" ? "bg-indigo-500/10 border-r-4 border-r-primary text-on-primary-container" : "text-on-surface-variant"}`}
            >
              <FilePlus size={20} className="text-white shrink-0" />
              New Posts
            </span>
            <span
                onClick={() => {navigate("/admin/tags")}}
                className={`flex items-center gap-3 text-lg px-3 py-4 rounded-lg w-full cursor-pointer
                ${page === "tags" ? "bg-indigo-500/10 border-r-4 border-r-primary text-on-primary-container" : "text-on-surface-variant"}`}
            >
              <Tag size={20} className="text-white shrink-0" />
              Tags
            </span>
          </div>
        </div>

        {/* bottom section */}
        <div className="border-t-[0.5px]">
          <div className="flex flex-col gap-1 mt-7">
            <span className="flex items-center gap-3 text-lg text-on-surface-variant px-3 py-4 rounded-lg min-w-57.5">
              <User size={20} className="text-white shrink-0" />
              Profile
            </span>
            <span className="flex items-center gap-3 text-lg text-on-surface-variant px-3 py-4 rounded-lg min-w-57.5">
              <Settings size={20} className="text-white shrink-0" />
              Settings
            </span>
          </div>

          {/* Profile card */}
          <div className="flex items-center gap-3 pt-4 px-3 mt-7">
            <img src={user?.avatar_url} className="w-10 h-10 rounded-full object-cover shrink-0 bg-surface-variant" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium text-on-surface truncate">{user?.name}</span>
              <span className="text-xs text-on-surface-variant truncate">Admin</span>
            </div>
            <button 
                onClick={() => { 
                  handleLogout(); 
                }}
                className="text-on-surface-variant hover:text-white transition-colors shrink-0 ml-auto"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Hamburger button — mobile only */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-5 left-5 z-30 p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-white transition-colors md:hidden"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Children container */}
      <div className="transition-all duration-300 ease-in-out md:pl-65 mx-5 my-5">
        {children}
      </div>
    </div>
  );
}