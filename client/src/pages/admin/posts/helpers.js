import { COVER_VARIANTS } from "./constants";

export function normalizePageParam(pageParam) {
    const parsedValue = Number.parseInt(pageParam ?? "1", 10);
    if (!Number.isFinite(parsedValue) || parsedValue < 1) {
        return 1;
    }

    return parsedValue;
}

export function formatPostDates(dateValue) {
    const parsedDate = new Date(dateValue ?? "");
    if (Number.isNaN(parsedDate.getTime())) {
        return {
            mobile: "N/A",
            desktop: "N/A",
        };
    }

    const formattedDate = parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const [monthAndDay = "", year = ""] = formattedDate.split(", ");
    return {
        mobile: formattedDate,
        desktop: `${monthAndDay},\n${year}`.trim(),
    };
}

export function mapStatus(statusValue) {
    const normalizedStatus = String(statusValue ?? "").trim().toUpperCase();
    if (normalizedStatus === "PUBLISHED") {
        return "PUBLISHED";
    }

    return "DRAFT";
}

export function mapReadTime(readingTimeValue) {
    const parsedMinutes = Number.parseInt(readingTimeValue, 10);
    if (Number.isFinite(parsedMinutes) && parsedMinutes > 0) {
        return `${parsedMinutes} min read`;
    }

    return "0 min read";
}

export function mapTagNames(tagsValue) {
    if (!Array.isArray(tagsValue)) {
        return [];
    }

    const normalizedTagNames = tagsValue
        .map((tagValue) => {
            if (typeof tagValue === "string") {
                return tagValue.trim();
            }

            if (tagValue && typeof tagValue.name === "string") {
                return tagValue.name.trim();
            }

            return "";
        })
        .filter(Boolean);

    return Array.from(new Set(normalizedTagNames));
}

export function mapPostForCard(postRow, fallbackIndex) {
    const parsedId = Number.parseInt(postRow?.id, 10);
    const postId = Number.isFinite(parsedId) ? parsedId : fallbackIndex + 1;
    const coverIndex = ((postId - 1) % COVER_VARIANTS.length + COVER_VARIANTS.length) % COVER_VARIANTS.length;
    const parsedViews = Number.parseInt(postRow?.views, 10);
    const parsedLikes = Number.parseInt(postRow?.likes, 10);
    const { mobile, desktop } = formatPostDates(postRow?.published_at ?? postRow?.created_at);
    const rawSlug = typeof postRow?.slug === "string" ? postRow.slug.trim() : "";
    const coverImage =
        typeof postRow?.cover_image === "string" && postRow.cover_image.trim()
            ? postRow.cover_image.trim()
            : null;

    return {
        id: postId,
        slug: rawSlug,
        coverImage,
        coverVariant: COVER_VARIANTS[coverIndex],
        title: postRow?.title?.trim() || "Untitled Post",
        readTime: mapReadTime(postRow?.reading_time),
        status: mapStatus(postRow?.status),
        views: Number.isFinite(parsedViews) && parsedViews > 0 ? parsedViews : 0,
        likes: Number.isFinite(parsedLikes) && parsedLikes > 0 ? parsedLikes : 0,
        dateMobile: mobile,
        dateDesktop: desktop,
        tags: mapTagNames(postRow?.tags),
        updatedAt: postRow?.updated_at ?? null,
    };
}
