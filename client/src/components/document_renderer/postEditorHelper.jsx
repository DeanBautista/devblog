export function normalizePreviewLinkHref(rawHref) {
    const href = (rawHref ?? "").trim();
    if (!href) return null;
    if (href.startsWith("/")) return href;
    return /^https?:\/\/\S+$/i.test(href) ? href : null;
}

export function renderInlineMarkdown(text, keyPrefix, INLINE_MARKDOWN_TOKEN_REGEX) {
    const value = typeof text === "string" ? text : String(text ?? "");
    INLINE_MARKDOWN_TOKEN_REGEX.lastIndex = 0;
    const renderedNodes = [];
    let cursor = 0;
    let tokenMatch = INLINE_MARKDOWN_TOKEN_REGEX.exec(value);

    while (tokenMatch) {
        const fullToken = tokenMatch[0];
        const tokenStart = tokenMatch.index;
        const tokenKey = `${keyPrefix}-${tokenStart}`;

        if (tokenStart > cursor) {
            renderedNodes.push(value.slice(cursor, tokenStart));
        }

        if (tokenMatch[2]) {
            renderedNodes.push(
                <code key={tokenKey} className="px-1 py-[2px] rounded bg-surface-container-low text-sm">
                    {tokenMatch[2]}
                </code>
            );
        } else if (tokenMatch[3]) {
            const safeHref = normalizePreviewLinkHref(tokenMatch[5]);

            if (!safeHref) {
                renderedNodes.push(fullToken);
            } else {
                renderedNodes.push(
                    <a
                        key={tokenKey}
                        href={safeHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2"
                    >
                        {tokenMatch[4]}
                    </a>
                );
            }
        } else if (tokenMatch[6]) {
            renderedNodes.push(<strong key={tokenKey}>{tokenMatch[7]}</strong>);
        } else if (tokenMatch[8]) {
            renderedNodes.push(<em key={tokenKey}>{tokenMatch[9]}</em>);
        } else {
            renderedNodes.push(fullToken);
        }

        cursor = tokenStart + fullToken.length;
        tokenMatch = INLINE_MARKDOWN_TOKEN_REGEX.exec(value);
    }

    if (cursor < value.length) {
        renderedNodes.push(value.slice(cursor));
    }

    return renderedNodes.length > 0 ? renderedNodes : value;
}

export function stripHeadingSuffix(text) {
    return text.replace(/\s+#+\s*$/, "").trim();
}