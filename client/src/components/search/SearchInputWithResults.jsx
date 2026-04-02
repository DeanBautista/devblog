import { Search } from 'lucide-react';

export default function SearchInputWithResults({
  value = '',
  onChange,
  placeholder = 'Search posts...',
  results = [],
  isLoading = false,
  renderResult,
  minQueryLength = 1,
  loadingLabel = 'Searching posts...',
  emptyLabel = 'No matching posts found.',
  wrapperClassName = 'w-full max-w-md',
}) {
  const queryLength = value.trim().length;
  const shouldShowPanel = queryLength >= minQueryLength;

  return (
    <div className={wrapperClassName}>
      <div className="relative">
        <label className="relative block overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full bg-transparent px-11 py-3 text-sm text-on-surface outline-none"
          />
        </label>

        {shouldShowPanel && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-outline-variant/30 bg-surface-container px-3 py-3 shadow-[0_20px_35px_rgba(3,8,24,0.35)]">
            {isLoading ? (
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-on-surface-variant">{loadingLabel}</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-on-surface-variant">{emptyLabel}</p>
            ) : (
              <div className="search-results-scrollbar flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
                {results.map((item, index) => renderResult(item, index))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
