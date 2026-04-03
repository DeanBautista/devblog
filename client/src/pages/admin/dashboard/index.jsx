import { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import DashboardSkeleton from './components/DashboardSkeleton';
import MetricCard from './components/MetricCard';
import TopArticlesSection from './components/TopArticlesSection';
import TagViewsSection from './components/TagViewsSection';
import useDashboardData from './hooks/useDashboardData';
import { DASHBOARD_FALLBACK_ERROR_MESSAGE, DASHBOARD_METRICS } from './constants';
import { formatMetricValue, formatSyncedAtLabel } from './helpers';

export default function DashboardPage() {
  const {
    summary,
    topArticles,
    topTags,
    isLoading,
    loadError,
    lastUpdatedAt,
    refreshDashboard,
  } = useDashboardData();

  const metricCards = useMemo(
    () =>
      DASHBOARD_METRICS.map((metric) => ({
        key: metric.key,
        label: metric.label,
        caption: metric.caption,
        value: formatMetricValue(summary[metric.key]),
      })),
    [summary]
  );

  return (
    <section className="min-h-screen w-full pt-14 md:pt-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">Dashboard</h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              Engagement overview across posts and tags.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-on-surface-variant">
              Last synced: {formatSyncedAtLabel(lastUpdatedAt)}
            </p>
            <button
              type="button"
              onClick={refreshDashboard}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant/35 bg-surface-container px-4 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>

        {!!loadError && (
          <article className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error sm:px-5">
            {loadError || DASHBOARD_FALLBACK_ERROR_MESSAGE}
          </article>
        )}

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {metricCards.map((metric) => (
                <MetricCard
                  key={metric.key}
                  label={metric.label}
                  value={metric.value}
                  caption={metric.caption}
                />
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <TopArticlesSection articles={topArticles} />
              <TagViewsSection tags={topTags} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
