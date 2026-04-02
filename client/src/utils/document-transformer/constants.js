export const HEADING_REGEX = /^(#{1,6})\s+(.+)$/;
export const CODE_FENCE_REGEX = /^```([\w-]*)\s*(.*)$/;
export const IMAGE_REGEX = /^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]+)")?\)$/;
export const ORDERED_LIST_REGEX = /^(\d+)\.\s+(.*)$/;
export const CHECKLIST_REGEX = /^[-*+]\s+\[( |x|X)\]\s+(.*)$/;
export const BULLET_LIST_REGEX = /^[-*+]\s+(.*)$/;
export const BLOCKQUOTE_REGEX = /^>\s?(.*)$/;
export const DIVIDER_REGEX = /^(?:-{3,}|\*{3,}|_{3,})$/;

export const KNOWN_POST_KEYS = new Set([
    "postTitle",
    "title",
    "heading",
    "name",
    "slug",
    "urlSlug",
    "path",
    "permalink",
    "canonicalUrl",
    "url",
    "excerpt",
    "summary",
    "description",
    "subtitle",
    "tags",
    "tagList",
    "topics",
    "labels",
    "author",
    "authorName",
    "writer",
    "byline",
    "authorAvatar",
    "avatar",
    "authorRole",
    "publishedAt",
    "publishDate",
    "date",
    "createdAt",
    "readTime",
    "readTimeMinutes",
    "readingTime",
    "minutesRead",
    "views",
    "viewCount",
    "totalViews",
    "likes",
    "likeCount",
    "totalLikes",
    "coverImage",
    "coverImageUrl",
    "heroImage",
    "image",
    "bannerImage",
    "nextPost",
    "nextArticle",
    "domain",
    "siteUrl",
]);
