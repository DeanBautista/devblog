import { useMemo, useRef } from "react";
import DocumentationToolbar from "./DocumentationToolbar";
import { collectHeadingMetadata } from "./editorParsing";
import { getDocumentationTools } from "./documentationToolsets";

const TOOL_ACTIONS = {
    bold: {
        kind: "wrap",
        before: "**",
        after: "**",
        fallback: "bold text",
    },
    italic: {
        kind: "wrap",
        before: "*",
        after: "*",
        fallback: "italic text",
    },
    heading: {
        kind: "linePrefix",
        prefix: "# ",
    },
    link: {
        kind: "wrap",
        before: "[",
        after: "](https://example.com)",
        fallback: "link text",
    },
    inlineCode: {
        kind: "wrap",
        before: "`",
        after: "`",
        fallback: "code",
    },
    codeBlock: {
        kind: "block",
        template: "\n```txt\ncode snippet\n```\n",
    },
    image: {
        kind: "block",
        template: "\n![Alt text](https://images.example.com/image.png)\n",
    },
    bulletList: {
        kind: "linePrefix",
        prefix: "- ",
    },
    divider: {
        kind: "block",
        template: "\n---\n",
    },
};

function wrapSelection({
    value,
    selectionStart,
    selectionEnd,
    before,
    after,
    fallback = "",
}) {
    const selected = value.slice(selectionStart, selectionEnd);
    const insertedText = `${before}${selected || fallback}${after}`;
    return {
        nextValue: `${value.slice(0, selectionStart)}${insertedText}${value.slice(selectionEnd)}`,
        nextSelectionStart: selectionStart + before.length,
        nextSelectionEnd: selectionStart + before.length + (selected || fallback).length,
    };
}

function insertAtSelection({
    value,
    selectionStart,
    selectionEnd,
    snippet,
}) {
    return {
        nextValue: `${value.slice(0, selectionStart)}${snippet}${value.slice(selectionEnd)}`,
        nextSelectionStart: selectionStart + snippet.length,
        nextSelectionEnd: selectionStart + snippet.length,
    };
}

function prefixCurrentLine({
    value,
    selectionStart,
    selectionEnd,
    prefix,
    toolId,
}) {
    const beforeCursor = value.slice(0, selectionStart);
    const lineStart = beforeCursor.lastIndexOf("\n") + 1;
    const lineEndIndex = value.indexOf("\n", lineStart);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const line = value.slice(lineStart, lineEnd);
    const leadingWhitespaceMatch = line.match(/^(\s*)(.*)$/);
    const leadingWhitespace = leadingWhitespaceMatch?.[1] ?? "";
    const lineContent = leadingWhitespaceMatch?.[2] ?? line;
    const contentStart = lineStart + leadingWhitespace.length;
    let insertionIndex = contentStart;
    let snippet = prefix;

    if (toolId === "heading") {
        const quotePrefixMatch = lineContent.match(/^(>\s?)(.*)$/);
        if (quotePrefixMatch) {
            insertionIndex = contentStart + quotePrefixMatch[1].length;
            const quotedContent = quotePrefixMatch[2];
            snippet = /^#{1,6}\s+/.test(quotedContent) ? "" : "# ";
        } else {
            snippet = /^#{1,6}\s+/.test(lineContent) ? "" : "# ";
        }
    } else {
        snippet = lineContent.startsWith(prefix) ? "" : prefix;
    }

    const selectionStartShift = snippet && insertionIndex <= selectionStart ? snippet.length : 0;
    const selectionEndShift = snippet && insertionIndex <= selectionEnd ? snippet.length : 0;

    return {
        nextValue: `${value.slice(0, insertionIndex)}${snippet}${value.slice(insertionIndex)}`,
        nextSelectionStart: selectionStart + selectionStartShift,
        nextSelectionEnd: selectionEnd + selectionEndShift,
    };
}

export default function DocumentationEditor({
    value,
    onChangeValue,
}) {
    const textareaRef = useRef(null);

    const tools = useMemo(() => getDocumentationTools(), []);
    const headings = useMemo(() => collectHeadingMetadata(value), [value]);

    const applyTool = (toolId) => {
        const action = TOOL_ACTIONS[toolId];
        if (!action || !textareaRef.current) return;

        const textarea = textareaRef.current;
        const selectionStart = textarea.selectionStart ?? 0;
        const selectionEnd = textarea.selectionEnd ?? selectionStart;
        let result = null;

        if (action.kind === "wrap") {
            result = wrapSelection({
                value,
                selectionStart,
                selectionEnd,
                before: action.before,
                after: action.after,
                fallback: action.fallback,
            });
        }

        if (action.kind === "block") {
            result = insertAtSelection({
                value,
                selectionStart,
                selectionEnd,
                snippet: action.template,
            });
        }

        if (action.kind === "linePrefix") {
            result = prefixCurrentLine({
                value,
                selectionStart,
                selectionEnd,
                prefix: action.prefix,
                toolId,
            });
        }

        if (!result) return;

        onChangeValue(result.nextValue);

        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(result.nextSelectionStart, result.nextSelectionEnd);
        });
    };

    return (
        <section className="mt-8 md:mt-10 rounded-2xl bg-surface-container overflow-hidden border border-outline-variant/30">
            <DocumentationToolbar tools={tools} onSelectTool={applyTool} />

            <div className="px-3 py-3 md:px-4 md:py-4">
                <div className="mb-2 flex items-center justify-between gap-2 text-xs text-secondary">
                    <span className="shrink-0">{headings.length} heading{headings.length === 1 ? "" : "s"}</span>
                </div>
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(event) => onChangeValue(event.target.value)}
                    placeholder="# Start writing your masterpiece..."
                    className="w-full min-h-[340px] md:min-h-[480px] lg:min-h-[560px] bg-surface-container-high rounded-xl p-4 outline-none resize-y text-sm md:text-base leading-7"
                />
            </div>
        </section>
    );
}
