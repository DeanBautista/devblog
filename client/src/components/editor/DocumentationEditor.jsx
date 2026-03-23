import { useMemo, useRef } from "react";
import DocumentationToolbar from "./DocumentationToolbar";
import { collectHeadingMetadata } from "./editorParsing";
import { DOCUMENTATION_TYPES, getDocumentationTools } from "./documentationToolsets";

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
    quote: {
        kind: "linePrefix",
        prefix: "> ",
    },
    bulletList: {
        kind: "linePrefix",
        prefix: "- ",
    },
    orderedList: {
        kind: "linePrefix",
        prefix: "1. ",
    },
    divider: {
        kind: "block",
        template: "\n---\n",
    },
    stepHeading: {
        kind: "block",
        template: "\n## Step 1: Describe the objective\n",
    },
    checklist: {
        kind: "block",
        template: "\n- [ ] First task\n- [ ] Second task\n",
    },
    infoCallout: {
        kind: "block",
        template: "\n> [!NOTE]\n> Add additional context here.\n",
    },
    warningCallout: {
        kind: "block",
        template: "\n> [!WARNING]\n> Highlight important caution details.\n",
    },
    endpointTemplate: {
        kind: "block",
        template: "\n### GET /v1/resource\nShort endpoint description.\n",
    },
    parametersTable: {
        kind: "block",
        template: "\n| Parameter | Type | Required | Description |\n| --- | --- | --- | --- |\n| id | string | yes | Resource identifier |\n",
    },
    requestExample: {
        kind: "block",
        template: "\n#### Request Example\n```http\nGET /v1/resource HTTP/1.1\nAuthorization: Bearer <token>\n```\n",
    },
    responseExample: {
        kind: "block",
        template: "\n#### Response Example\n```json\n{\n  \"id\": \"123\",\n  \"name\": \"Sample\"\n}\n```\n",
    },
    deprecationNote: {
        kind: "block",
        template: "\n> [!WARNING]\n> This endpoint is deprecated and will be removed in a future release.\n",
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
    prefix,
}) {
    const beforeCursor = value.slice(0, selectionStart);
    const lineStart = beforeCursor.lastIndexOf("\n") + 1;
    const alreadyPrefixed = value.slice(lineStart, lineStart + prefix.length) === prefix;
    const snippet = alreadyPrefixed ? "" : prefix;

    return {
        nextValue: `${value.slice(0, lineStart)}${snippet}${value.slice(lineStart)}`,
        nextSelectionStart: selectionStart + snippet.length,
        nextSelectionEnd: selectionStart + snippet.length,
    };
}

export default function DocumentationEditor({
    documentationType,
    onChangeDocumentationType,
    value,
    onChangeValue,
}) {
    const textareaRef = useRef(null);

    const tools = useMemo(() => getDocumentationTools(documentationType), [documentationType]);
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
                prefix: action.prefix,
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
            <div className="px-3 pt-3 pb-0 md:px-4 md:pt-4">
                <label htmlFor="documentation-type" className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant">
                    Documentation Type
                </label>
                <select
                    id="documentation-type"
                    className="mt-2 w-full md:max-w-[320px] bg-surface-container-high border border-outline-variant/40 rounded-lg px-3 py-2 text-sm outline-none"
                    value={documentationType}
                    onChange={(event) => onChangeDocumentationType(event.target.value)}
                >
                    {DOCUMENTATION_TYPES.map((docType) => (
                        <option key={docType.id} value={docType.id}>
                            {docType.label}
                        </option>
                    ))}
                </select>
            </div>

            <DocumentationToolbar tools={tools} onSelectTool={applyTool} />

            <div className="px-3 py-3 md:px-4 md:py-4">
                <div className="mb-2 flex items-center justify-between gap-2 text-xs text-secondary">
                    <span>Use `#` to define a section title. Example: `# I Love Science`</span>
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
