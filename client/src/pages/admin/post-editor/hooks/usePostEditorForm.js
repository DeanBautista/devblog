import { useEffect, useMemo, useRef, useState } from "react";
import usePostEditorStore from "../../../../stores/postEditorStore";
import api from "../../../../lib/axios";
import { normalizeSlug } from "../../../../utils/slug";
import { MIN_POST_TAGS, MAX_POST_TAGS } from "../constants";

export default function usePostEditorForm() {
    const postTitle = usePostEditorStore((state) => state.postTitle);
    const postSlug = usePostEditorStore((state) => state.postSlug);
    const postExcerpt = usePostEditorStore((state) => state.postExcerpt);
    const editorContent = usePostEditorStore((state) => state.editorContent);
    const editorView = usePostEditorStore((state) => state.editorView);
    const readTimeMinutes = usePostEditorStore((state) => state.readTimeMinutes);
    const selectedTagIds = usePostEditorStore((state) => state.selectedTagIds);
    const setPostTitle = usePostEditorStore((state) => state.setPostTitle);
    const setPostSlug = usePostEditorStore((state) => state.setPostSlug);
    const setPostExcerpt = usePostEditorStore((state) => state.setPostExcerpt);
    const setEditorContent = usePostEditorStore((state) => state.setEditorContent);
    const setEditorView = usePostEditorStore((state) => state.setEditorView);
    const setReadTimeMinutes = usePostEditorStore((state) => state.setReadTimeMinutes);
    const setSelectedTagIds = usePostEditorStore((state) => state.setSelectedTagIds);
    const toggleSelectedTagId = usePostEditorStore((state) => state.toggleSelectedTagId);
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
    const [availableTags, setAvailableTags] = useState([]);
    const [isTagsLoading, setIsTagsLoading] = useState(false);
    const [tagsLoadError, setTagsLoadError] = useState("");
    const [tagSearchTerm, setTagSearchTerm] = useState("");

    const hasPostTitle = postTitle.trim().length > 0;
    const activeCoverPreview = preview || null;
    const normalizedReadTimeMinutes = readTimeMinutes.trim();
    const readTimeDisplayLabel = `${normalizedReadTimeMinutes || "0"} min read`;
    const normalizedTagSearchTerm = tagSearchTerm.trim().toLowerCase();

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

    useEffect(() => {
        let shouldIgnore = false;

        const loadAvailableTags = async () => {
            setIsTagsLoading(true);
            setTagsLoadError("");

            try {
                const response = await api.get("/api/tags", {
                    params: { page: 1, limit: 100 },
                });

                if (shouldIgnore) return;

                const rows = Array.isArray(response.data?.data) ? response.data.data : [];
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

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(file));
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
                tag_ids: selectedTagIds,
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
        submitError,
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
        handlePublish,
        handleConfirmPublish,
        handleReadTimeChange,
        handleToggleTagSelection,
        handleCloseExcerptModal,
    };
}
