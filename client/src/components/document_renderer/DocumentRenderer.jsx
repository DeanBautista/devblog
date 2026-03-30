import { useMemo } from "react";
import { renderInlineMarkdown, stripHeadingSuffix } from "./postEditorHelper";
import { INLINE_MARKDOWN_TOKEN_REGEX, previewHeadingClassByLevel, QUOTED_HEADING_REGEX, STATIC_PREVIEW_AUTHOR } from "./postEditorConstants";
import { parseDocumentBlocks } from "../../utils/postDocumentTransformer";

function DocumentHeading ({ level, children, className = "" }) {
    const headingLevel = Math.max(1, Math.min(6, level || 2));
    const Tag = `h${headingLevel}`;
    const h1QuoteStyleClass = headingLevel === 1 ? "border-l-2 border-primary-container pl-4" : "";

    return <Tag className={`${previewHeadingClassByLevel[headingLevel]} ${h1QuoteStyleClass} ${className}`.trim()}>{children}</Tag>;
}

export default function DocumentRenderer({ value }) {
    const blocks = useMemo(() => parseDocumentBlocks(value), [value]);

    if (blocks.length === 0) {
        return (
            <section className="mt-8 md:mt-10">
                <div className="py-6 md:py-8">
                    <p className="text-sm text-secondary">Start writing to see your article preview.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="mt-8 md:mt-10">
            <div className="flex flex-col gap-5 md:gap-6 text-sm md:text-base leading-7">
                {blocks.map((block, index) => {
                    if (block.type === "heading") {
                        return (
                            <DocumentHeading 
                                key={`preview-heading-${index}`}
                                level={block.level}
                            >
                                {renderInlineMarkdown(block.text, `heading-${index}`, INLINE_MARKDOWN_TOKEN_REGEX)}
                            </DocumentHeading>
                        );
                    }

                    if (block.type === "paragraph") {
                        return (
                            <p key={`preview-paragraph-${index}`} className="text-on-surface">
                                {renderInlineMarkdown(block.text, `paragraph-${index}`, INLINE_MARKDOWN_TOKEN_REGEX)}
                            </p>
                        );
                    }

                    if (block.type === "code") {
                        return (
                            <div
                                key={`preview-code-${index}`}
                                className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-low"
                            >
                                {block.fileName ? (
                                    <div className="px-3 py-2 text-[11px] md:text-xs font-medium uppercase tracking-wider border-b border-outline-variant/40 text-secondary">
                                        {block.fileName}
                                    </div>
                                ) : null}

                                <pre className="px-4 py-3 overflow-x-auto text-xs md:text-sm leading-6">
                                    <code>{block.code}</code>
                                </pre>
                            </div>
                        );
                    }

                    if (block.type === "quote") {
                        const quoteLines = Array.isArray(block.lines) && block.lines.length > 0
                            ? block.lines
                            : [block.text];

                        return (
                            <blockquote
                                key={`preview-quote-${index}`}
                                className="border-l-2 border-primary-container pl-4 text-on-surface"
                            >
                                <div className="flex flex-col gap-3">
                                    {quoteLines.map((line, lineIndex) => {
                                        const normalizedLine = line.trim();
                                        if (!normalizedLine) {
                                            return <div key={`preview-quote-${index}-line-${lineIndex}`} className="h-2" />;
                                        }

                                        const quoteHeadingMatch = normalizedLine.match(QUOTED_HEADING_REGEX);
                                        if (quoteHeadingMatch) {
                                            return (
                                                <PreviewHeading
                                                    key={`preview-quote-${index}-heading-${lineIndex}`}
                                                    level={quoteHeadingMatch[1].length}
                                                    className="text-on-surface"
                                                >
                                                    {renderInlineMarkdown(stripHeadingSuffix(quoteHeadingMatch[2]), `quote-heading-${index}-${lineIndex}`, INLINE_MARKDOWN_TOKEN_REGEX)}
                                                </PreviewHeading>
                                            );
                                        }

                                        return (
                                            <p key={`preview-quote-${index}-text-${lineIndex}`}>
                                                {renderInlineMarkdown(normalizedLine, `quote-${index}-${lineIndex}`, INLINE_MARKDOWN_TOKEN_REGEX)}
                                            </p>
                                        );
                                    })}
                                </div>
                            </blockquote>
                        );
                    }

                    if (block.type === "list") {
                        if (block.ordered) {
                            return (
                                <ol key={`preview-list-${index}`} className="list-decimal pl-6 space-y-2">
                                    {block.items.map((item, itemIndex) => (
                                        <li key={`preview-list-${index}-item-${itemIndex}`}>
                                            {renderInlineMarkdown(item.text, `ordered-${index}-${itemIndex}`, INLINE_MARKDOWN_TOKEN_REGEX)}
                                        </li>
                                    ))}
                                </ol>
                            );
                        }

                        if (block.checklist) {
                            return (
                                <ul key={`preview-checklist-${index}`} className="space-y-2">
                                    {block.items.map((item, itemIndex) => (
                                        <li key={`preview-checklist-${index}-item-${itemIndex}`} className="flex items-start gap-2">
                                            <input
                                                type="checkbox"
                                                checked={item.checked}
                                                readOnly
                                                className="mt-1 accent-primary-container"
                                            />
                                            <span>{renderInlineMarkdown(item.text, `check-${index}-${itemIndex}`, INLINE_MARKDOWN_TOKEN_REGEX)}</span>
                                        </li>
                                    ))}
                                </ul>
                            );
                        }

                        return (
                            <ul key={`preview-bullet-${index}`} className="list-disc pl-6 space-y-2">
                                {block.items.map((item, itemIndex) => (
                                    <li key={`preview-bullet-${index}-item-${itemIndex}`}>
                                        {renderInlineMarkdown(item.text, `bullet-${index}-${itemIndex}`, INLINE_MARKDOWN_TOKEN_REGEX)}
                                    </li>
                                ))}
                            </ul>
                        );
                    }

                    if (block.type === "image") {
                        return (
                            <figure
                                key={`preview-image-${index}`}
                                className="overflow-hidden"
                            >
                                <img
                                    src={block.src}
                                    alt={block.alt || "Preview image"}
                                    className="w-full max-h-[520px] object-cover rounded-xl"
                                />
                                {(block.title || block.alt) ? (
                                    <figcaption className="text-center px-3 py-2 text-xs text-secondary">
                                        {block.title || block.alt}
                                    </figcaption>
                                ) : null}
                            </figure>
                        );
                    }

                    if (block.type === "divider") {
                        return <hr key={`preview-divider-${index}`} className="border-outline-variant/50" />;
                    }

                    return (
                        <p key={`preview-fallback-${index}`} className="text-on-surface">
                            {block.raw}
                        </p>
                    );
                })}
            </div>
        </section>
    );
}