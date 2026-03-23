export const DOCUMENTATION_TYPES = [
    { id: "technicalArticle", label: "Technical Article" },
    { id: "tutorial", label: "Tutorial" },
    { id: "apiReference", label: "API Reference" },
];

const SHARED_TOOL_IDS = [
    "bold",
    "italic",
    "heading",
    "link",
    "inlineCode",
    "codeBlock",
    "image",
];

const TYPE_SPECIFIC_TOOL_IDS = {
    technicalArticle: ["quote", "bulletList", "orderedList", "divider"],
    tutorial: ["stepHeading", "checklist", "infoCallout", "warningCallout"],
    apiReference: ["endpointTemplate", "parametersTable", "requestExample", "responseExample", "deprecationNote"],
};

export const TOOL_DEFINITIONS = {
    bold: { id: "bold", label: "Bold", token: "B" },
    italic: { id: "italic", label: "Italic", token: "I" },
    heading: { id: "heading", label: "Heading", token: "H1" },
    link: { id: "link", label: "Link", token: "Link" },
    inlineCode: { id: "inlineCode", label: "Inline Code", token: "<>" },
    codeBlock: { id: "codeBlock", label: "Code Block", token: "{ }" },
    image: { id: "image", label: "Image", token: "Img" },

    quote: { id: "quote", label: "Quote", token: "\"" },
    bulletList: { id: "bulletList", label: "Bulleted List", token: "-" },
    orderedList: { id: "orderedList", label: "Numbered List", token: "1." },
    divider: { id: "divider", label: "Divider", token: "---" },

    stepHeading: { id: "stepHeading", label: "Step Heading", token: "Step" },
    checklist: { id: "checklist", label: "Checklist", token: "[ ]" },
    infoCallout: { id: "infoCallout", label: "Info Callout", token: "Info" },
    warningCallout: { id: "warningCallout", label: "Warning Callout", token: "Warn" },

    endpointTemplate: { id: "endpointTemplate", label: "Endpoint Block", token: "API" },
    parametersTable: { id: "parametersTable", label: "Parameters Table", token: "Tbl" },
    requestExample: { id: "requestExample", label: "Request Example", token: "Req" },
    responseExample: { id: "responseExample", label: "Response Example", token: "Res" },
    deprecationNote: { id: "deprecationNote", label: "Deprecation Note", token: "Dep" },
};

export function getDocumentationTools(documentationType) {
    const fallbackType = DOCUMENTATION_TYPES[0].id;
    const normalizedType = TYPE_SPECIFIC_TOOL_IDS[documentationType] ? documentationType : fallbackType;
    const toolIds = [...SHARED_TOOL_IDS, ...TYPE_SPECIFIC_TOOL_IDS[normalizedType]];
    return toolIds.map((toolId) => TOOL_DEFINITIONS[toolId]).filter(Boolean);
}
