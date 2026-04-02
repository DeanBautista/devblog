export const TAGS_PER_PAGE = 8;
export const TAG_POSTS_PER_PAGE = 5;

export const DEFAULT_PAGINATION = {
    page: 1,
    limit: TAGS_PER_PAGE,
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
};

export function createTagPostsState() {
    return {
        posts: [],
        isLoading: false,
        isLoaded: false,
        errorMessage: '',
        pagination: {
            page: 1,
            limit: TAG_POSTS_PER_PAGE,
            total: 0,
            totalPages: 1,
            hasPrev: false,
            hasNext: false,
        },
    };
}
