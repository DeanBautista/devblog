const HEADING_REGEX = /^(#{1,6})\s+(.+)$/;

export function parseHeadingLine(rawLine) {
    const line = rawLine ?? "";
    const match = line.match(HEADING_REGEX);

    if (!match) {
        return {
            type: "paragraph",
            level: 0,
            text: line,
        };
    }

    return {
        type: "heading",
        level: match[1].length,
        text: match[2],
    };
}

export function collectHeadingMetadata(content) {
    const lines = (content ?? "").split("\n");

    return lines
        .map((line, index) => {
            const parsed = parseHeadingLine(line);
            return parsed.type === "heading"
                ? {
                    lineIndex: index,
                    level: parsed.level,
                    text: parsed.text,
                }
                : null;
        })
        .filter(Boolean);
}
