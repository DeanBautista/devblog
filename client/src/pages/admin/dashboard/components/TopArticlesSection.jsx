import { formatDateLabel, formatMetricValue } from '../helpers';

export default function TopArticlesSection({ articles }) {
  const topArticles = Array.isArray(articles) ? articles : [];

  return (
    <section className="rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-4 sm:px-5">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-on-surface">Top 5 Popular Articles</h2>
        <span className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant/80">Published</span>
      </header>

      {topArticles.length < 1 ? (
        <p className="mt-4 rounded-lg border border-outline-variant/25 bg-surface-container px-3 py-4 text-sm text-on-surface-variant">
          No published articles yet.
        </p>
      ) : (
        <ol className="mt-4 flex flex-col gap-3">
          {topArticles.map((article, index) => {
            return (
              <li
                key={`${article.id}-${index}`}
                className="rounded-lg border border-outline-variant/25 bg-surface-container px-3 py-3"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-xs font-semibold text-[#1b1f3b]">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-on-surface">{article.title}</p>

                    <p className="mt-1 text-xs text-on-surface-variant">
                      {formatDateLabel(article.publishedAt ?? article.createdAt)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right text-xs text-on-surface-variant">
                    <p>{formatMetricValue(article.views)} views</p>
                    <p>{formatMetricValue(article.likes)} likes</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
