export function normalizePageParam(pageParam) {
    const parsedValue = Number.parseInt(pageParam ?? '1', 10);

    if (!Number.isFinite(parsedValue) || parsedValue < 1) {
        return 1;
    }

    return parsedValue;
}

export function mapTagRow(tagRow) {
    const parsedId = Number.parseInt(tagRow?.id, 10);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
        return null;
    }

    return {
        id: parsedId,
        name: String(tagRow?.name ?? '').trim(),
        slug: String(tagRow?.slug ?? '').trim(),
        usage_count: Number.parseInt(tagRow?.usage_count, 10) || 0,
    };
}

export function mapTagPost(postRow) {
    const parsedId = Number.parseInt(postRow?.id, 10);

    if (!Number.isInteger(parsedId) || parsedId < 1) {
        return null;
    }

    return {
        id: parsedId,
        title: String(postRow?.title ?? 'Untitled Post').trim() || 'Untitled Post',
        slug: String(postRow?.slug ?? ''),
        status: String(postRow?.status ?? 'draft'),
        reading_time: Number.parseInt(postRow?.reading_time, 10) || 0,
        views: Number.parseInt(postRow?.views, 10) || 0,
        published_at: postRow?.published_at ?? null,
        created_at: postRow?.created_at ?? null,
    };
}

export function extractErrorMessage(error, fallbackMessage) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        fallbackMessage
    );
}
