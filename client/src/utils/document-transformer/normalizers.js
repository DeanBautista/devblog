import { toText, firstText, isRecord, parseCount, parseReadTimeMinutes, parseDate } from "./validators";
import { KNOWN_POST_KEYS } from "./constants";

export function formatCompactLabel(value, suffix) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return null;
    }

    const compact = new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    })
        .format(value)
        .toLowerCase();

    return `${compact} ${suffix}`;
}

export function formatPublishedDate(value) {
    const parsedDate = parseDate(value);
    if (!parsedDate) {
        return toText(value);
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(parsedDate);
}

export function normalizeSlug(value) {
    const normalizedValue = toText(value);
    if (!normalizedValue) {
        return null;
    }

    return normalizedValue
        .toLowerCase()
        .replace(/^[\\/]+|[\\/]+$/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9/_-]/g, "")
        .replace(/\/+/g, "/");
}

function normalizeAuthor(post) {
    const authorValue = post.author;
    const authorObject = isRecord(authorValue) ? authorValue : {};
    const authorName = firstText(
        typeof authorValue === "string" ? authorValue : null,
        authorObject.name,
        authorObject.fullName,
        post.authorName,
        post.writer,
        post.byline
    );

    return {
        name: authorName ?? "Unknown Author",
        avatarUrl: firstText(authorObject.avatarUrl, authorObject.avatar, authorObject.image, post.authorAvatar, post.avatar),
        role: firstText(authorObject.role, authorObject.title, post.authorRole),
    };
}

export function normalizeTags(value) {
    const rawTags = Array.isArray(value)
        ? value
        : typeof value === "string"
            ? value.split(",")
            : [];

    return rawTags
        .map((tag) => toText(tag))
        .filter(Boolean)
        .map((tag) => {
            const rawTag = tag.replace(/^#/, "").trim();
            const normalizedTag = rawTag.replace(/\s+/g, "-");
            return {
                value: rawTag,
                label: `#${normalizedTag.toUpperCase()}`,
            };
        });
}

function normalizeNextPost(nextPostValue) {
    if (typeof nextPostValue === "string") {
        return {
            title: nextPostValue.trim(),
            slug: null,
            href: null,
        };
    }

    if (!isRecord(nextPostValue)) {
        return null;
    }

    const title = firstText(nextPostValue.title, nextPostValue.postTitle, nextPostValue.name);
    const slug = normalizeSlug(firstText(nextPostValue.slug, nextPostValue.path));
    const href = firstText(nextPostValue.href, nextPostValue.url, slug ? `/blog/${slug}` : null);

    if (!title && !href) {
        return null;
    }

    return {
        title,
        slug,
        href,
    };
}

export function normalizePostData(postInput) {
    const post = isRecord(postInput) ? postInput : {};
    const title = firstText(post.postTitle, post.title, post.heading, post.name);
    const slug = normalizeSlug(firstText(post.slug, post.urlSlug, post.path));
    const siteUrl = firstText(post.siteUrl, post.domain);
    const permalink = firstText(
        post.permalink,
        post.canonicalUrl,
        post.url,
        siteUrl && slug ? `${siteUrl.replace(/\/+$/, "")}/blog/${slug}` : null,
        slug ? `obsidian.io/blog/${slug}` : null
    );

    const readTimeMinutes = parseReadTimeMinutes(post.readTimeMinutes, post.readingTime, post.minutesRead, post.readTime);
    const readTimeLabel = firstText(
        typeof post.readTime === "string" && /read/i.test(post.readTime) ? post.readTime : null,
        readTimeMinutes !== null ? `${readTimeMinutes} min read` : null,
        post.readTime
    );

    const views = parseCount(firstText(post.views, post.viewCount, post.totalViews));
    const viewsLabel = firstText(
        typeof post.views === "string" && /views?/i.test(post.views) ? post.views : null,
        views !== null ? formatCompactLabel(views, "views") : null
    );

    const likes = parseCount(firstText(post.likes, post.likeCount, post.totalLikes));
    const likesLabel = firstText(
        typeof post.likes === "string" && /likes?/i.test(post.likes) ? post.likes : null,
        likes !== null ? formatCompactLabel(likes, "likes") : null
    );

    const publishedAtValue = firstText(post.publishedAt, post.publishDate, post.date, post.createdAt);
    const publishedAtDate = parseDate(publishedAtValue);
    const publishedAt = publishedAtDate ? publishedAtDate.toISOString() : null;
    const publishedAtLabel = formatPublishedDate(publishedAtValue);

    const rawTags = post.tags ?? post.tagList ?? post.topics ?? post.labels;
    const tags = normalizeTags(rawTags);
    const coverImage = firstText(post.coverImage, post.coverImageUrl, post.heroImage, post.image, post.bannerImage);
    const excerpt = firstText(post.excerpt, post.summary, post.description, post.subtitle);

    const extraData = Object.fromEntries(
        Object.entries(post).filter(([key]) => !KNOWN_POST_KEYS.has(key))
    );

    return {
        title,
        slug,
        permalink,
        excerpt,
        tags,
        author: normalizeAuthor(post),
        publishedAt,
        publishedAtLabel,
        readTimeMinutes,
        readTimeLabel,
        views,
        viewsLabel,
        likes,
        likesLabel,
        coverImage,
        nextPost: normalizeNextPost(post.nextPost ?? post.nextArticle),
        extraData,
        allData: post,
    };
}

export function normalizeHeadingKey(value) {
    const normalizedValue = toText(value);
    if (!normalizedValue) {
        return "";
    }

    return normalizedValue.toLowerCase().replace(/[^\w]+/g, " ").trim();
}

export function createHeadingAnchor(value) {
    const normalizedValue = toText(value);
    if (!normalizedValue) {
        return null;
    }

    return normalizedValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}
