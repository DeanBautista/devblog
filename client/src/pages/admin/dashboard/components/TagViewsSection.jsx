import { formatMetricValue } from '../helpers';

export default function TagViewsSection({ tags }) {
  const topTags = Array.isArray(tags) ? tags : [];
  const maxViews = topTags.reduce(
    (highestValue, tag) => Math.max(highestValue, Number(tag?.totalViews) || 0),
    0
  );

  return (
    <section className="rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-4 sm:px-5">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-on-surface">Top Tags by Views</h2>
        <span className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant/80">Tag-linked views</span>
      </header>

      {topTags.length < 1 ? (
        <p className="mt-4 rounded-lg border border-outline-variant/25 bg-surface-container px-3 py-4 text-sm text-on-surface-variant">
          No tag usage data yet.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {topTags.map((tag, index) => {
            const totalViews = Number(tag?.totalViews) || 0;
            const widthRatio = maxViews > 0 ? Math.max((totalViews / maxViews) * 100, 8) : 8;

            return (
              <li
                key={`${tag.id}-${index}`}
                className="rounded-lg border border-outline-variant/25 bg-surface-container px-3 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-on-surface">#{tag.name}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {formatMetricValue(tag.articleCount)} linked posts
                    </p>
                  </div>

                  <p className="shrink-0 text-xs font-medium text-on-surface-variant">
                    {formatMetricValue(totalViews)} views
                  </p>
                </div>

                <div className="mt-3 h-2 rounded-full bg-surface-container-high">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-primary/80 to-primary-container"
                    style={{ width: `${Math.min(widthRatio, 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
