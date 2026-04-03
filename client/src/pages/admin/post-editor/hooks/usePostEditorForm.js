import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { EDITOR_VIEWS } from "../../../../components/document_renderer/postEditorConstants";
import {
    createAdminPost,
    deleteAdminPostCover,
    getAdminPostById,
    getAdminPostBySlug,
    uploadAdminPostCover,
    updateAdminPost,
} from "../../../../lib/posts";
import { getAdminTags } from "../../../../lib/tags";
import usePostEditorStore from "../../../../stores/postEditorStore";
import { normalizeSlug } from "../../../../utils/slug";
import { MIN_POST_TAGS, MAX_POST_TAGS } from "../constants";

const SLUG_EDIT_PATH_PATTERN = /^\/admin\/newposts\/(?!id\/)[^/]+\/?$/;
const LEAVE_SLUG_EDIT_PROMPT_MESSAGE =
    "Leaving this editor will discard unsaved changes. Continue?";
const POST_EDITOR_DRAFT_STORAGE_KEY = "post-editor-draft";
const RELOAD_DRAFT_RESET_FLAG_KEY = "post-editor-clear-on-reload";

function normalizeIncomingTagIds(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    const normalizedIds = value
        .map((tagId) => Number.parseInt(tagId, 10))
        .filter((tagId) => Number.isInteger(tagId) && tagId > 0);

    return Array.from(new Set(normalizedIds));
}

function formatDateLabel(value) {
    const parsedDate = new Date(value ?? "");

    if (Number.isNaN(parsedDate.getTime())) {
        return new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    return parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatLastEditedLabel(value, isEditMode) {
    if (!isEditMode) {
        return "Last edited just now";
    }

    const parsedDate = new Date(value ?? "");

    if (Number.isNaN(parsedDate.getTime())) {
        return "Last edited recently";
    }

    return `Last edited ${parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })}`;
}

function isSlugEditPath(pathname) {
    if (typeof pathname !== "string") {
        return false;
    }

    return SLUG_EDIT_PATH_PATTERN.test(pathname);
}

export default function usePostEditorForm() {
    const navigate = useNavigate();
    const { slug: routeSlugParam, postId: routePostIdParam } = useParams();

    const postTitle = usePostEditorStore((state) => state.postTitle);
    const postSlug = usePostEditorStore((state) => state.postSlug);
    const postExcerpt = usePostEditorStore((state) => state.postExcerpt);
    const editorContent = usePostEditorStore((state) => state.editorContent);
    const coverImageUrl = usePostEditorStore((state) => state.coverImageUrl);
    const hasUploadedCoverInSession = usePostEditorStore((state) => state.hasUploadedCoverInSession);
    const editorView = usePostEditorStore((state) => state.editorView);
    const readTimeMinutes = usePostEditorStore((state) => state.readTimeMinutes);
    const selectedTagIds = usePostEditorStore((state) => state.selectedTagIds);
    const setPostTitle = usePostEditorStore((state) => state.setPostTitle);
    const setPostSlug = usePostEditorStore((state) => state.setPostSlug);
    const setPostExcerpt = usePostEditorStore((state) => state.setPostExcerpt);
    const setEditorContent = usePostEditorStore((state) => state.setEditorContent);
    const setCoverImageUrl = usePostEditorStore((state) => state.setCoverImageUrl);
    const setHasUploadedCoverInSession = usePostEditorStore((state) => state.setHasUploadedCoverInSession);
    const setEditorView = usePostEditorStore((state) => state.setEditorView);
    const setReadTimeMinutes = usePostEditorStore((state) => state.setReadTimeMinutes);
    const setSelectedTagIds = usePostEditorStore((state) => state.setSelectedTagIds);
    const toggleSelectedTagId = usePostEditorStore((state) => state.toggleSelectedTagId);
    const resetDraft = usePostEditorStore((state) => state.resetDraft);

    const fileInputRef = useRef(null);
    const titleTextareaRef = useRef(null);
    const wasEditModeRef = useRef(false);
    const uploadSequenceRef = useRef(0);
    const isBypassingNavigationRef = useRef(false);

    const [isCoverUploading, setIsCoverUploading] = useState(false);
    const [coverUploadError, setCoverUploadError] = useState("");
    const [isExcerptModalOpen, setIsExcerptModalOpen] = useState(false);
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
    const [isConfirmPublishModalOpen, setIsConfirmPublishModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [validationErrors, setValidationErrors] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [isTagsLoading, setIsTagsLoading] = useState(false);
    const [tagsLoadError, setTagsLoadError] = useState("");
    const [tagSearchTerm, setTagSearchTerm] = useState("");
    const [isPostLoading, setIsPostLoading] = useState(false);
    const [editingPostId, setEditingPostId] = useState(null);
    const [publishDateValue, setPublishDateValue] = useState(null);
    const [lastEditedAt, setLastEditedAt] = useState(null);

    const hasPostTitle = postTitle.trim().length > 0;
    const activeCoverPreview = coverImageUrl || null;
    const normalizedReadTimeMinutes = readTimeMinutes.trim();
    const readTimeDisplayLabel = `${normalizedReadTimeMinutes || "0"} min read`;
    const normalizedTagSearchTerm = tagSearchTerm.trim().toLowerCase();
    const normalizedRouteSlug = useMemo(() => normalizeSlug(routeSlugParam), [routeSlugParam]);
    const normalizedRoutePostId = useMemo(() => {
        const parsedPostId = Number.parseInt(routePostIdParam, 10);
        return Number.isInteger(parsedPostId) && parsedPostId > 0 ? parsedPostId : null;
    }, [routePostIdParam]);
    const isIdRoute = routePostIdParam != null;
    const isSlugRoute = routeSlugParam != null;
    const isEditMode = isIdRoute || isSlugRoute;
    const resolvedEditingPostId =
        Number.isInteger(editingPostId) && editingPostId > 0 ? editingPostId : null;

    const selectedTags = useMemo(() => {
        if (selectedTagIds.length < 1) {
            return [];
        }

        const tagMap = new Map(availableTags.map((tag) => [tag.id, tag]));

        return selectedTagIds.map((tagId) => {
            const mappedTag = tagMap.get(tagId);
            if (mappedTag) {
                return mappedTag;
            }
            return {
                id: tagId,
                name: `Tag #${tagId}`,
                slug: "",
            };
        });
    }, [availableTags, selectedTagIds]);

    const filteredTags = useMemo(() => {
        if (!normalizedTagSearchTerm) {
            return availableTags;
        }

        return availableTags.filter((tag) => {
            const normalizedName = String(tag.name ?? "").toLowerCase();
            const normalizedSlug = String(tag.slug ?? "").toLowerCase();

            return (
                normalizedName.includes(normalizedTagSearchTerm) ||
                normalizedSlug.includes(normalizedTagSearchTerm)
            );
        });
    }, [availableTags, normalizedTagSearchTerm]);

    const publishDateDisplayLabel = useMemo(() => formatDateLabel(publishDateValue), [publishDateValue]);
    const lastEditedDisplayLabel = useMemo(
        () => formatLastEditedLabel(lastEditedAt, isEditMode),
        [isEditMode, lastEditedAt]
    );

    const clearTransientFormState = useCallback(() => {
        setTagSearchTerm("");
        setValidationErrors([]);
        setIsExcerptModalOpen(false);
        setIsValidationModalOpen(false);
        setIsConfirmPublishModalOpen(false);
        setCoverUploadError("");
        setIsCoverUploading(false);
        uploadSequenceRef.current += 1;

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    const navigateWithBypass = useCallback(
        (to, options) => {
            isBypassingNavigationRef.current = true;

            try {
                const navigationResult = navigate(to, options);

                Promise.resolve(navigationResult).finally(() => {
                    isBypassingNavigationRef.current = false;
                });
            } catch (error) {
                isBypassingNavigationRef.current = false;
                throw error;
            }
        },
        [navigate]
    );

    const clearPersistedEditorDraft = useCallback(() => {
        resetDraft();

        if (typeof window === "undefined") {
            return;
        }

        try {
            window.sessionStorage.removeItem(POST_EDITOR_DRAFT_STORAGE_KEY);
            window.sessionStorage.removeItem(RELOAD_DRAFT_RESET_FLAG_KEY);
        } catch {
            // Ignore storage cleanup failures.
        }
    }, [resetDraft]);

    const shouldBlockSlugEditLeave = useCallback(({ currentLocation, nextLocation }) => {
        if (isBypassingNavigationRef.current) {
            return false;
        }

        const currentPathname = String(currentLocation?.pathname ?? "");
        const nextPathname = String(nextLocation?.pathname ?? "");

        if (!isSlugEditPath(currentPathname)) {
            return false;
        }

        if (nextPathname === "/admin/login") {
            return false;
        }

        return currentPathname !== nextPathname;
    }, []);

    const leaveRouteBlocker = useBlocker(shouldBlockSlugEditLeave);

    useEffect(() => {
        if (leaveRouteBlocker.state !== "blocked") {
            return;
        }

        const shouldContinue = window.confirm(LEAVE_SLUG_EDIT_PROMPT_MESSAGE);

        if (shouldContinue) {
            clearPersistedEditorDraft();
            leaveRouteBlocker.proceed();
            return;
        }

        leaveRouteBlocker.reset();
    }, [clearPersistedEditorDraft, leaveRouteBlocker]);

    useEffect(() => {
        if (isEditMode) {
            wasEditModeRef.current = true;
            return;
        }

        if (wasEditModeRef.current) {
            resetDraft();
            clearTransientFormState();
            wasEditModeRef.current = false;

            setEditingPostId(null);
            setPublishDateValue(null);
            setLastEditedAt(null);
            setCoverImageUrl(null);
            setHasUploadedCoverInSession(false);
            setCoverUploadError("");

            return;
        }

        setEditingPostId(null);
        setPublishDateValue(null);
        setLastEditedAt(null);
        setCoverUploadError("");
    }, [
        clearTransientFormState,
        isEditMode,
        resetDraft,
        setCoverImageUrl,
        setHasUploadedCoverInSession,
    ]);

    useEffect(() => {
        if (titleTextareaRef.current) {
            titleTextareaRef.current.style.height = "auto";
            titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
        }
    }, [postTitle, editorView]);

    useEffect(() => {
        let shouldIgnore = false;

        const loadAvailableTags = async () => {
            setIsTagsLoading(true);
            setTagsLoadError("");

            try {
                const responseBody = await getAdminTags({ page: 1, limit: 100 });

                if (shouldIgnore) return;

                const rows = Array.isArray(responseBody?.data) ? responseBody.data : [];
                const normalizedTags = rows
                    .map((row) => {
                        const parsedId = Number.parseInt(row?.id, 10);
                        if (!Number.isInteger(parsedId) || parsedId < 1) {
                            return null;
                        }
                        return {
                            id: parsedId,
                            name: String(row?.name ?? "").trim(),
                            slug: String(row?.slug ?? "").trim(),
                        };
                    })
                    .filter(Boolean);

                setAvailableTags(normalizedTags);
            } catch (error) {
                if (shouldIgnore) return;

                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    "Unable to load available tags.";

                setAvailableTags([]);
                setTagsLoadError(message);
            } finally {
                if (!shouldIgnore) {
                    setIsTagsLoading(false);
                }
            }
        };

        loadAvailableTags();

        return () => {
            shouldIgnore = true;
        };
    }, []);

    useEffect(() => {
        let shouldIgnore = false;

        const redirectToHome = () => {
            navigateWithBypass("/", { replace: true });
        };

        const loadEditablePost = async () => {
            if (!isEditMode) {
                return;
            }

            if (isIdRoute && normalizedRoutePostId == null) {
                redirectToHome();
                return;
            }

            if (isSlugRoute && !normalizedRouteSlug) {
                redirectToHome();
                return;
            }

            try {
                setIsPostLoading(true);
                setSubmitError("");

                const responseBody = isIdRoute
                    ? await getAdminPostById(normalizedRoutePostId)
                    : await getAdminPostBySlug(normalizedRouteSlug);

                if (shouldIgnore) {
                    return;
                }

                const post = responseBody?.data ?? {};
                const fetchedPostId = Number.parseInt(post?.id, 10);

                if (!Number.isInteger(fetchedPostId) || fetchedPostId < 1) {
                    throw new Error("Invalid post payload");
                }

                setEditingPostId(fetchedPostId);
                setPostTitle(String(post?.title ?? ""));
                setPostSlug(String(post?.slug ?? ""));
                setPostExcerpt(String(post?.excerpt ?? ""));
                setEditorContent(String(post?.content ?? ""));

                const nextReadTime = Number.parseInt(post?.reading_time, 10);
                setReadTimeMinutes(
                    Number.isInteger(nextReadTime) && nextReadTime > 0
                        ? String(nextReadTime)
                        : "1"
                );

                setSelectedTagIds(normalizeIncomingTagIds(post?.tag_ids));
                setEditorView(EDITOR_VIEWS.WRITE);

                setPublishDateValue(post?.published_at ?? post?.created_at ?? null);
                setLastEditedAt(post?.updated_at ?? post?.created_at ?? null);
                setCoverImageUrl(
                    typeof post?.cover_image === "string" && post.cover_image.trim()
                        ? post.cover_image.trim()
                        : null
                );
                setHasUploadedCoverInSession(false);
                setCoverUploadError("");

                clearTransientFormState();
            } catch (error) {
                if (shouldIgnore) {
                    return;
                }

                const statusCode = Number.parseInt(error?.response?.status, 10);

                if (statusCode === 400 || statusCode === 401 || statusCode === 403 || statusCode === 404) {
                    redirectToHome();
                    return;
                }

                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    "Unable to load post right now. Please try again.";

                setSubmitError(message);
                setIsErrorModalOpen(true);
            } finally {
                if (!shouldIgnore) {
                    setIsPostLoading(false);
                }
            }
        };

        loadEditablePost();

        return () => {
            shouldIgnore = true;
        };
    }, [
        clearTransientFormState,
        isEditMode,
        isIdRoute,
        isSlugRoute,
        navigateWithBypass,
        normalizedRoutePostId,
        normalizedRouteSlug,
        setEditorContent,
        setEditorView,
        setPostExcerpt,
        setPostSlug,
        setPostTitle,
        setCoverImageUrl,
        setHasUploadedCoverInSession,
        setReadTimeMinutes,
        setSelectedTagIds,
    ]);

    useEffect(() => {
        if (selectedTagIds.length > MAX_POST_TAGS) {
            setSelectedTagIds(selectedTagIds.slice(0, MAX_POST_TAGS));
        }
    }, [selectedTagIds, setSelectedTagIds]);

    useEffect(() => {
        if (selectedTagIds.length < 1 || availableTags.length < 1) {
            return;
        }

        const validTagIdSet = new Set(availableTags.map((tag) => tag.id));
        const sanitizedTagIds = selectedTagIds.filter((tagId) => validTagIdSet.has(tagId));

        if (sanitizedTagIds.length !== selectedTagIds.length) {
            setSelectedTagIds(sanitizedTagIds);
        }
    }, [availableTags, selectedTagIds, setSelectedTagIds]);

    const handleImageChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const currentUploadSequence = uploadSequenceRef.current + 1;
        uploadSequenceRef.current = currentUploadSequence;

        const previousCoverImageUrl = coverImageUrl;
        const shouldCleanupPreviousUpload = hasUploadedCoverInSession && Boolean(previousCoverImageUrl);

        try {
            setIsCoverUploading(true);
            setCoverUploadError("");

            const uploadResponse = await uploadAdminPostCover(file);
            const uploadedUrl =
                typeof uploadResponse?.data?.url === "string" && uploadResponse.data.url.trim()
                    ? uploadResponse.data.url.trim()
                    : "";

            if (!uploadedUrl) {
                throw new Error("Cover image upload returned an empty URL.");
            }

            if (currentUploadSequence !== uploadSequenceRef.current) {
                void deleteAdminPostCover(uploadedUrl).catch(() => null);
                return;
            }

            setCoverImageUrl(uploadedUrl);
            setHasUploadedCoverInSession(true);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            if (
                shouldCleanupPreviousUpload &&
                previousCoverImageUrl &&
                previousCoverImageUrl !== uploadedUrl
            ) {
                void deleteAdminPostCover(previousCoverImageUrl).catch(() => null);
            }
        } catch (error) {
            if (currentUploadSequence !== uploadSequenceRef.current) {
                return;
            }

            const isTimeoutError =
                error?.code === "ECONNABORTED" ||
                (typeof error?.message === "string" && error.message.toLowerCase().includes("timeout"));

            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                (isTimeoutError
                    ? "Cover upload timed out. Try a smaller image or retry."
                    : error?.message) ||
                "Unable to upload cover image right now. Please try again.";

            setCoverUploadError(message);
        } finally {
            if (currentUploadSequence === uploadSequenceRef.current) {
                setIsCoverUploading(false);
            }
        }
    };

    const getResolvedSlug = () => {
        return normalizeSlug(postSlug) || normalizeSlug(postTitle);
    };

    const buildSubmissionPayload = (status) => {
        return {
            title: postTitle.trim(),
            slug: getResolvedSlug(),
            excerpt: postExcerpt.trim(),
            content: editorContent.trim(),
            reading_time: Number.parseInt(normalizedReadTimeMinutes, 10),
            cover_image: coverImageUrl,
            tag_ids: selectedTagIds,
            status,
        };
    };

    const resetFormState = () => {
        resetDraft();
        setEditingPostId(null);
        setPublishDateValue(null);
        setLastEditedAt(null);
        setCoverImageUrl(null);
        setHasUploadedCoverInSession(false);
        setCoverUploadError("");
        clearTransientFormState();
    };

    const handleSuccessModalClose = () => {
        setIsSuccessModalOpen(false);

        if (!isEditMode) {
            return;
        }

        resetFormState();
        navigateWithBypass("/admin/newposts", { replace: true });
    };

    const handlePublish = () => {
        if (isSubmitting || isPostLoading || isCoverUploading) return;

        const errors = [];
        if (!postTitle.trim()) errors.push("Post title");
        if (!postExcerpt.trim()) errors.push("Post excerpt");
        if (!normalizedReadTimeMinutes || normalizedReadTimeMinutes === "0") errors.push("Read time");
        if (!editorContent.trim()) errors.push("Main content");
        if (!getResolvedSlug()) errors.push("URL slug");
        if (selectedTagIds.length < MIN_POST_TAGS || selectedTagIds.length > MAX_POST_TAGS) {
            errors.push(`Tag selection (choose ${MIN_POST_TAGS}-${MAX_POST_TAGS} tags)`);
        }

        if (errors.length > 0) {
            setValidationErrors(errors);
            setIsValidationModalOpen(true);
            return;
        }

        setSubmitError("");
        setIsConfirmPublishModalOpen(true);
    };

    const handleConfirmPublish = async () => {
        if (isSubmitting || isPostLoading || isCoverUploading) return;

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
                ...buildSubmissionPayload("published"),
                slug: resolvedSlug,
            };

            const responseBody =
                isEditMode && resolvedEditingPostId
                    ? await updateAdminPost(resolvedEditingPostId, payload)
                    : await createAdminPost(payload);

            if (isEditMode && resolvedEditingPostId) {
                const updatedPost = responseBody?.post ?? {};
                const nextPostId = Number.parseInt(updatedPost?.id, 10);
                const nextSlug = normalizeSlug(updatedPost?.slug);

                if (Number.isInteger(nextPostId) && nextPostId > 0) {
                    setEditingPostId(nextPostId);

                    if (
                        isSlugRoute &&
                        normalizedRouteSlug &&
                        nextSlug &&
                        nextSlug !== normalizedRouteSlug
                    ) {
                        navigateWithBypass(`/admin/newposts/id/${nextPostId}`, { replace: true });
                    }
                }

                setPublishDateValue(updatedPost?.published_at ?? publishDateValue ?? new Date());
                setLastEditedAt(updatedPost?.updated_at ?? new Date().toISOString());
            } else {
                resetFormState();
            }

            setSuccessMessage(responseBody?.message || "Post published successfully.");
            setIsSuccessModalOpen(true);
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                (isEditMode
                    ? "Unable to update and publish post right now. Please try again."
                    : "Unable to publish post right now. Please try again.");

            setSubmitError(message);
            setIsErrorModalOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDraft = async () => {
        if (isSubmitting || isPostLoading || isCoverUploading) return;

        try {
            setIsSubmitting(true);
            setSubmitError("");

            const payload = buildSubmissionPayload("draft");
            const responseBody =
                isEditMode && resolvedEditingPostId
                    ? await updateAdminPost(resolvedEditingPostId, payload)
                    : await createAdminPost(payload);

            if (isEditMode && resolvedEditingPostId) {
                const updatedPost = responseBody?.post ?? {};
                const nextPostId = Number.parseInt(updatedPost?.id, 10);
                const nextSlug = normalizeSlug(updatedPost?.slug);

                if (Number.isInteger(nextPostId) && nextPostId > 0) {
                    setEditingPostId(nextPostId);

                    if (
                        isSlugRoute &&
                        normalizedRouteSlug &&
                        nextSlug &&
                        nextSlug !== normalizedRouteSlug
                    ) {
                        navigateWithBypass(`/admin/newposts/id/${nextPostId}`, { replace: true });
                    }
                }

                setPublishDateValue(updatedPost?.published_at ?? publishDateValue ?? null);
                setLastEditedAt(updatedPost?.updated_at ?? new Date().toISOString());
            } else {
                resetFormState();
            }

            setSuccessMessage(responseBody?.message || "Post draft saved successfully.");
            setIsSuccessModalOpen(true);
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                (isEditMode
                    ? "Unable to update draft right now. Please try again."
                    : "Unable to save draft right now. Please try again.");

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

    const handleToggleTagSelection = (tagId) => {
        const parsedTagId = Number.parseInt(tagId, 10);

        if (!Number.isInteger(parsedTagId) || parsedTagId < 1) {
            return;
        }

        const isSelected = selectedTagIds.includes(parsedTagId);

        if (!isSelected && selectedTagIds.length >= MAX_POST_TAGS) {
            return;
        }

        toggleSelectedTagId(parsedTagId);
    };

    const handleCloseExcerptModal = () => {
        setIsExcerptModalOpen(false);
    };

    return {
        // Refs
        fileInputRef,
        titleTextareaRef,

        // Store values
        postTitle,
        postSlug,
        postExcerpt,
        editorContent,
        editorView,
        readTimeMinutes,
        selectedTagIds,

        // Store setters
        setPostTitle,
        setPostSlug,
        setPostExcerpt,
        setEditorContent,
        setEditorView,

        // Derived values
        isEditMode,
        isPostLoading,
        lastEditedDisplayLabel,
        hasPostTitle,
        activeCoverPreview,
        normalizedReadTimeMinutes,
        readTimeDisplayLabel,
        normalizedTagSearchTerm,
        selectedTags,
        filteredTags,
        publishDateDisplayLabel,

        // Modal states
        isExcerptModalOpen,
        setIsExcerptModalOpen,
        isValidationModalOpen,
        setIsValidationModalOpen,
        isConfirmPublishModalOpen,
        setIsConfirmPublishModalOpen,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        isErrorModalOpen,
        setIsErrorModalOpen,

        // Submission states
        isSubmitting,
        isCoverUploading,
        submitError,
        coverUploadError,
        successMessage,
        validationErrors,

        // Tags
        availableTags,
        isTagsLoading,
        tagsLoadError,
        tagSearchTerm,
        setTagSearchTerm,

        // Handlers
        handleImageChange,
        handleDraft,
        handlePublish,
        handleConfirmPublish,
        handleSuccessModalClose,
        handleReadTimeChange,
        handleToggleTagSelection,
        handleCloseExcerptModal,
    };
}
