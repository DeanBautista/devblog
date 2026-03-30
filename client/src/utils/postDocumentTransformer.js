const HEADING_REGEX = /^(#{1,6})\s+(.+)$/;
const CODE_FENCE_REGEX = /^```([\w-]*)\s*(.*)$/;
const IMAGE_REGEX = /^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]+)")?\)$/;
const ORDERED_LIST_REGEX = /^(\d+)\.\s+(.*)$/;
const CHECKLIST_REGEX = /^[-*+]\s+\[( |x|X)\]\s+(.*)$/;
const BULLET_LIST_REGEX = /^[-*+]\s+(.*)$/;
const BLOCKQUOTE_REGEX = /^>\s?(.*)$/;
const DIVIDER_REGEX = /^(?:-{3,}|\*{3,}|_{3,})$/;

const KNOWN_POST_KEYS = new Set([
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

function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toText(value) {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }

    return null;
}

function firstText(...values) {
    for (const value of values) {
        const normalizedValue = toText(value);
        if (normalizedValue) {
            return normalizedValue;
        }
    }

    return null;
}

function parseCount(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.max(0, Math.round(value));
    }

    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
        return null;
    }

    const compactMatch = trimmed.match(/^([\d,.]+)\s*([km])$/);
    if (compactMatch) {
        const base = Number(compactMatch[1].replace(/,/g, ""));
        if (!Number.isFinite(base)) {
            return null;
        }

        const multiplier = compactMatch[2] === "m" ? 1000000 : 1000;
        return Math.round(base * multiplier);
    }

    const numberMatch = trimmed.match(/([\d,.]+)/);
    if (!numberMatch) {
        return null;
    }

    const parsedValue = Number(numberMatch[1].replace(/,/g, ""));
    if (!Number.isFinite(parsedValue)) {
        return null;
    }

    return Math.round(parsedValue);
}

function formatCompactLabel(value, suffix) {
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

function parseReadTimeMinutes(...candidates) {
    for (const candidate of candidates) {
        if (typeof candidate === "number" && Number.isFinite(candidate)) {
            return Math.max(0, Math.round(candidate));
        }

        if (typeof candidate !== "string") {
            continue;
        }

        const match = candidate.match(/(\d+)/);
        if (!match) {
            continue;
        }

        const minutes = Number(match[1]);
        if (Number.isFinite(minutes)) {
            return Math.max(0, Math.round(minutes));
        }
    }

    return null;
}

function parseDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
    }

    const normalizedValue = toText(value);
    if (!normalizedValue) {
        return null;
    }

    const parsedDate = new Date(normalizedValue);
    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return parsedDate;
}

function formatPublishedDate(value) {
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

function normalizeSlug(value) {
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

function normalizeTags(value) {
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

function normalizePostData(postInput) {
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

function stripTrailingHeadingHashes(text) {
    return text.replace(/\s+#+\s*$/, "").trim();
}

function extractCodeFileName(meta) {
    const quotedTitle = meta.match(/title\s*=\s*"([^"]+)"/i);
    if (quotedTitle) {
        return quotedTitle[1].trim();
    }

    const unquotedTitle = meta.match(/title\s*=\s*([^\s]+)/i);
    if (unquotedTitle) {
        return unquotedTitle[1].trim();
    }

    const fileNameCandidate = meta.match(/\b([\w.-]+\.[\w-]+)\b/);
    if (fileNameCandidate) {
        return fileNameCandidate[1];
    }

    return null;
}

function isBlockBoundary(line) {
    const normalizedLine = line.trimStart();
    const trimmedLine = normalizedLine.trim();

    return (
        CODE_FENCE_REGEX.test(normalizedLine) ||
        HEADING_REGEX.test(normalizedLine) ||
        IMAGE_REGEX.test(normalizedLine) ||
        ORDERED_LIST_REGEX.test(normalizedLine) ||
        CHECKLIST_REGEX.test(normalizedLine) ||
        BULLET_LIST_REGEX.test(normalizedLine) ||
        BLOCKQUOTE_REGEX.test(normalizedLine) ||
        DIVIDER_REGEX.test(trimmedLine)
    );
}

function parseCodeBlock(lines, startIndex) {
    const openingLine = lines[startIndex].trimStart();
    const match = openingLine.match(CODE_FENCE_REGEX);
    const language = match?.[1]?.trim() || null;
    const meta = match?.[2]?.trim() || "";
    const fileName = meta ? extractCodeFileName(meta) : null;

    const codeLines = [];
    let lineIndex = startIndex + 1;

    while (lineIndex < lines.length) {
        const currentLine = lines[lineIndex];
        if (currentLine.trimStart().startsWith("```")) {
            lineIndex += 1;
            break;
        }

        codeLines.push(currentLine);
        lineIndex += 1;
    }

    return {
        nextIndex: lineIndex,
        block: {
            type: "code",
            language,
            fileName,
            meta: meta || null,
            code: codeLines.join("\n"),
            raw: lines.slice(startIndex, lineIndex).join("\n"),
        },
    };
}

function parseBlockQuote(lines, startIndex) {
    const quoteLines = [];
    let lineIndex = startIndex;

    while (lineIndex < lines.length) {
        const currentLine = lines[lineIndex].trimStart();
        const quoteMatch = currentLine.match(BLOCKQUOTE_REGEX);
        if (!quoteMatch) {
            break;
        }

        quoteLines.push(quoteMatch[1]);
        lineIndex += 1;
    }

    return {
        nextIndex: lineIndex,
        block: {
            type: "quote",
            text: quoteLines.join("\n").trim(),
            lines: quoteLines,
            raw: lines.slice(startIndex, lineIndex).join("\n"),
        },
    };
}

function parseOrderedList(lines, startIndex) {
    const items = [];
    let lineIndex = startIndex;

    while (lineIndex < lines.length) {
        const currentLine = lines[lineIndex].trimStart();
        const orderedMatch = currentLine.match(ORDERED_LIST_REGEX);
        if (!orderedMatch) {
            break;
        }

        items.push({
            order: Number(orderedMatch[1]),
            text: orderedMatch[2].trim(),
        });

        lineIndex += 1;
    }

    return {
        nextIndex: lineIndex,
        block: {
            type: "list",
            ordered: true,
            checklist: false,
            items,
            raw: lines.slice(startIndex, lineIndex).join("\n"),
        },
    };
}

function parseBulletOrChecklist(lines, startIndex) {
    const items = [];
    let lineIndex = startIndex;
    let checklist = false;

    while (lineIndex < lines.length) {
        const currentLine = lines[lineIndex].trimStart();
        const checklistMatch = currentLine.match(CHECKLIST_REGEX);
        const bulletMatch = currentLine.match(BULLET_LIST_REGEX);

        if (!checklistMatch && !bulletMatch) {
            break;
        }

        if (checklistMatch) {
            checklist = true;
            items.push({
                text: checklistMatch[2].trim(),
                checked: checklistMatch[1].toLowerCase() === "x",
            });
        } else {
            items.push({
                text: bulletMatch[1].trim(),
                checked: false,
            });
        }

        lineIndex += 1;
    }

    return {
        nextIndex: lineIndex,
        block: {
            type: "list",
            ordered: false,
            checklist,
            items,
            raw: lines.slice(startIndex, lineIndex).join("\n"),
        },
    };
}

function parseParagraph(lines, startIndex) {
    const paragraphLines = [];
    let lineIndex = startIndex;

    while (lineIndex < lines.length) {
        const currentLine = lines[lineIndex];
        if (!currentLine.trim()) {
            break;
        }

        if (lineIndex !== startIndex && isBlockBoundary(currentLine)) {
            break;
        }

        paragraphLines.push(currentLine.trim());
        lineIndex += 1;
    }

    return {
        nextIndex: lineIndex,
        block: {
            type: "paragraph",
            text: paragraphLines.join(" "),
            lines: paragraphLines,
            raw: lines.slice(startIndex, lineIndex).join("\n"),
        },
    };
}

export function parseDocumentBlocks(documentContent) {
    const normalizedContent = typeof documentContent === "string" ? documentContent : String(documentContent ?? "");
    const lines = normalizedContent.replace(/\r\n/g, "\n").split("\n");
    const blocks = [];

    let lineIndex = 0;

    while (lineIndex < lines.length) {
        const rawLine = lines[lineIndex];
        const normalizedLine = rawLine.trimStart();
        const trimmedLine = normalizedLine.trim();

        if (!trimmedLine) {
            lineIndex += 1;
            continue;
        }

        if (CODE_FENCE_REGEX.test(normalizedLine)) {
            const codeResult = parseCodeBlock(lines, lineIndex);
            blocks.push(codeResult.block);
            lineIndex = codeResult.nextIndex;
            continue;
        }

        const headingMatch = normalizedLine.match(HEADING_REGEX);
        if (headingMatch) {
            blocks.push({
                type: "heading",
                level: headingMatch[1].length,
                text: stripTrailingHeadingHashes(headingMatch[2]),
                raw: rawLine,
            });
            lineIndex += 1;
            continue;
        }

        const imageMatch = normalizedLine.match(IMAGE_REGEX);
        if (imageMatch) {
            blocks.push({
                type: "image",
                alt: imageMatch[1].trim(),
                src: imageMatch[2].trim(),
                title: imageMatch[3] ? imageMatch[3].trim() : null,
                raw: rawLine,
            });
            lineIndex += 1;
            continue;
        }

        if (DIVIDER_REGEX.test(trimmedLine)) {
            blocks.push({
                type: "divider",
                raw: rawLine,
            });
            lineIndex += 1;
            continue;
        }

        if (BLOCKQUOTE_REGEX.test(normalizedLine)) {
            const quoteResult = parseBlockQuote(lines, lineIndex);
            blocks.push(quoteResult.block);
            lineIndex = quoteResult.nextIndex;
            continue;
        }

        if (ORDERED_LIST_REGEX.test(normalizedLine)) {
            const orderedListResult = parseOrderedList(lines, lineIndex);
            blocks.push(orderedListResult.block);
            lineIndex = orderedListResult.nextIndex;
            continue;
        }

        if (CHECKLIST_REGEX.test(normalizedLine) || BULLET_LIST_REGEX.test(normalizedLine)) {
            const bulletListResult = parseBulletOrChecklist(lines, lineIndex);
            blocks.push(bulletListResult.block);
            lineIndex = bulletListResult.nextIndex;
            continue;
        }

        const paragraphResult = parseParagraph(lines, lineIndex);
        blocks.push(paragraphResult.block);
        lineIndex = paragraphResult.nextIndex;
    }

    return blocks;
}

function normalizeHeadingKey(value) {
    const normalizedValue = toText(value);
    if (!normalizedValue) {
        return "";
    }

    return normalizedValue.toLowerCase().replace(/[^\w]+/g, " ").trim();
}

function createHeadingAnchor(value) {
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

function applyHeroHeadingRules(blocks, postTitle) {
    const contentBlocks = [...blocks];
    let heroTitle = toText(postTitle);

    const firstBlock = contentBlocks[0];
    if (firstBlock?.type === "heading" && firstBlock.level === 1) {
        const firstHeadingTitle = firstBlock.text;

        if (!heroTitle) {
            heroTitle = firstHeadingTitle;
            contentBlocks.shift();
        } else if (normalizeHeadingKey(heroTitle) === normalizeHeadingKey(firstHeadingTitle)) {
            contentBlocks.shift();
        } else {
            contentBlocks[0] = {
                ...firstBlock,
                level: 2,
            };
        }
    }

    return {
        heroTitle,
        contentBlocks,
    };
}

function addContentMetadata(blocks) {
    return blocks.map((block, index) => {
        if (block.type !== "heading") {
            return {
                id: `block-${index + 1}`,
                ...block,
            };
        }

        return {
            id: `block-${index + 1}`,
            ...block,
            anchor: createHeadingAnchor(block.text),
            style: block.level === 2 ? "section-heading" : "heading",
        };
    });
}

function buildHero(metadata) {
    return {
        title: metadata.title,
        coverImage: metadata.coverImage,
        tags: metadata.tags,
        excerpt: metadata.excerpt,
        author: metadata.author,
        stats: [
            { id: "published", label: metadata.publishedAtLabel },
            { id: "readTime", label: metadata.readTimeLabel },
            { id: "views", label: metadata.viewsLabel },
        ].filter((entry) => entry.label),
    };
}

export function transformPostDocumentToRenderModel({ post, document } = {}) {
    const normalizedPost = normalizePostData(post);
    const parsedBlocks = parseDocumentBlocks(document ?? "");
    const { heroTitle, contentBlocks } = applyHeroHeadingRules(parsedBlocks, normalizedPost.title);
    const title = heroTitle ?? "Untitled Post";
    const normalizedContent = addContentMetadata(contentBlocks);

    const metadata = {
        title,
        postTitle: title,
        slug: normalizedPost.slug,
        permalink: normalizedPost.permalink,
        excerpt: normalizedPost.excerpt,
        tags: normalizedPost.tags,
        author: normalizedPost.author,
        publishedAt: normalizedPost.publishedAt,
        publishedAtLabel: normalizedPost.publishedAtLabel,
        readTimeMinutes: normalizedPost.readTimeMinutes,
        readTimeLabel: normalizedPost.readTimeLabel,
        views: normalizedPost.views,
        viewsLabel: normalizedPost.viewsLabel,
        likes: normalizedPost.likes,
        likesLabel: normalizedPost.likesLabel,
        coverImage: normalizedPost.coverImage,
        nextPost: normalizedPost.nextPost,
        extraData: normalizedPost.extraData,
        allData: normalizedPost.allData,
    };

    const headings = normalizedContent
        .filter((block) => block.type === "heading")
        .map((heading) => ({
            id: heading.id,
            level: heading.level,
            text: heading.text,
            anchor: heading.anchor,
            style: heading.style,
        }));

    return {
        type: "article-render-model",
        hero: buildHero(metadata),
        metadata,
        headings,
        content: normalizedContent,
        source: {
            post: normalizedPost.allData,
            document: typeof document === "string" ? document : String(document ?? ""),
        },
    };
}

export default transformPostDocumentToRenderModel;
