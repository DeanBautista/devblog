export function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function toText(value) {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }

    return null;
}

export function firstText(...values) {
    for (const value of values) {
        const normalizedValue = toText(value);
        if (normalizedValue) {
            return normalizedValue;
        }
    }

    return null;
}

export function parseCount(value) {
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

export function parseReadTimeMinutes(...candidates) {
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

export function parseDate(value) {
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
