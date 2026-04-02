export const POSTS_PER_PAGE = 5;

export const COVER_VARIANTS = ["mint", "graphite", "parchment", "ivory"];

export const SKELETON_CARD_KEYS = Array.from(
    { length: POSTS_PER_PAGE },
    (_, index) => `post-skeleton-${index}`
);

export const DEFAULT_PAGINATION = {
    page: 1,
    limit: POSTS_PER_PAGE,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
};

export const FILTER_TABS = [
    { label: "All", value: "all" },
    { label: "Published", value: "published" },
    { label: "Drafts", value: "draft" },
];
