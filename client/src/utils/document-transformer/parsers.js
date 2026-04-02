import {
    HEADING_REGEX,
    CODE_FENCE_REGEX,
    IMAGE_REGEX,
    ORDERED_LIST_REGEX,
    CHECKLIST_REGEX,
    BULLET_LIST_REGEX,
    BLOCKQUOTE_REGEX,
    DIVIDER_REGEX,
} from "./constants";

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
