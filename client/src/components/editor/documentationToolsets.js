const TOOL_IDS = [
    "heading",
    "bold",
    "italic",
    "link",
    "inlineCode",
    "codeBlock",
    "image",
    "bulletList",
    "divider",
];

export const TOOL_DEFINITIONS = {
    heading: { id: "heading", label: "Heading", token: "H1" },
    bold: { id: "bold", label: "Bold", token: "B" },
    italic: { id: "italic", label: "Italic", token: "I" },
    link: { id: "link", label: "Link", token: "Link" },
    inlineCode: { id: "inlineCode", label: "Inline Code", token: "<>" },
    codeBlock: { id: "codeBlock", label: "Code Block", token: "{ }" },
    image: { id: "image", label: "Image", token: "Img" },

    bulletList: { id: "bulletList", label: "Bulleted List", token: "-" },
    divider: { id: "divider", label: "Divider", token: "---" },
};

export function getDocumentationTools() {
    return TOOL_IDS.map((toolId) => TOOL_DEFINITIONS[toolId]).filter(Boolean);
}
