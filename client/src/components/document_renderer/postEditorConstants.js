export const EDITOR_VIEWS = {
    WRITE: "write",
    PREVIEW: "preview",
};

export const previewHeadingClassByLevel = {
    1: "text-4xl md:text-5xl font-bold leading-tight",
    2: "text-3xl md:text-4xl font-bold leading-tight",
    3: "text-2xl md:text-3xl font-semibold leading-tight",
    4: "text-xl md:text-2xl font-semibold leading-tight",
    5: "text-lg md:text-xl font-semibold leading-tight",
    6: "text-base font-semibold uppercase tracking-wide leading-tight",
};

export const INLINE_MARKDOWN_TOKEN_REGEX = /(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;

export const QUOTED_HEADING_REGEX = /^(#{1,6})\s+(.+)$/;

export const STATIC_PREVIEW_AUTHOR = {
    name: "John Doe",
    avatarUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23222a3d'/%3E%3Ccircle cx='40' cy='30' r='16' fill='%23b9c8de'/%3E%3Cpath d='M14 72c4-14 16-22 26-22s22 8 26 22' fill='%23b9c8de'/%3E%3C/svg%3E",
};