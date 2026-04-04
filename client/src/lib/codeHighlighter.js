import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";

const REGISTERED_LANGUAGES = Object.freeze({
    bash,
    css,
    javascript,
    json,
    markdown,
    php,
    python,
    sql,
    typescript,
    xml,
});

Object.entries(REGISTERED_LANGUAGES).forEach(([name, languageDefinition]) => {
    hljs.registerLanguage(name, languageDefinition);
});

const LANGUAGE_ALIASES = Object.freeze({
    cjs: "javascript",
    ecmascript: "javascript",
    html: "xml",
    js: "javascript",
    jsx: "javascript",
    md: "markdown",
    py: "python",
    react: "javascript",
    "react.js": "javascript",
    reactjs: "javascript",
    shell: "bash",
    sh: "bash",
    ts: "typescript",
    tsx: "typescript",
    zsh: "bash",
});

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function normalizeLanguage(language) {
    if (typeof language !== "string") {
        return null;
    }

    const normalizedLanguage = language.trim().toLowerCase();
    if (!normalizedLanguage) {
        return null;
    }

    return LANGUAGE_ALIASES[normalizedLanguage] || normalizedLanguage;
}

export function highlightCode(code, language) {
    const codeText = typeof code === "string" ? code : String(code ?? "");
    const normalizedLanguage = normalizeLanguage(language);

    if (!normalizedLanguage || !hljs.getLanguage(normalizedLanguage)) {
        return {
            html: escapeHtml(codeText),
            language: normalizedLanguage || "plaintext",
        };
    }

    try {
        return {
            html: hljs.highlight(codeText, {
                language: normalizedLanguage,
                ignoreIllegals: true,
            }).value,
            language: normalizedLanguage,
        };
    } catch {
        return {
            html: escapeHtml(codeText),
            language: normalizedLanguage,
        };
    }
}
