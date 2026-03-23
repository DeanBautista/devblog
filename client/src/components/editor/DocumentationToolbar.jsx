export default function DocumentationToolbar({
    tools,
    onSelectTool,
}) {
    return (
        <div className="flex flex-wrap gap-2 md:gap-3 border-b border-outline-variant/40 px-3 py-3 md:px-4 md:py-3">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    type="button"
                    onClick={() => onSelectTool(tool.id)}
                    className="h-8 min-w-8 px-2 rounded-md bg-surface-container-low hover:bg-surface-container-high transition-colors text-xs md:text-sm text-on-surface-variant hover:text-on-surface"
                    title={tool.label}
                    aria-label={tool.label}
                >
                    {tool.token}
                </button>
            ))}
        </div>
    );
}
