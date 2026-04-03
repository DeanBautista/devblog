import { DASHBOARD_SKELETON_METRIC_KEYS } from '../constants';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {DASHBOARD_SKELETON_METRIC_KEYS.map((key) => (
          <article
            key={key}
            className="animate-pulse rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-4 sm:px-5"
          >
            <div className="h-3 w-24 rounded bg-surface-container-high" />
            <div className="mt-4 h-8 w-20 rounded bg-surface-container-high" />
            <div className="mt-3 h-3 w-32 rounded bg-surface-container-high" />
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="animate-pulse rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-4 sm:px-5">
          <div className="h-5 w-48 rounded bg-surface-container-high" />
          <div className="mt-4 space-y-3">
            <div className="h-16 rounded-lg bg-surface-container-high" />
            <div className="h-16 rounded-lg bg-surface-container-high" />
            <div className="h-16 rounded-lg bg-surface-container-high" />
          </div>
        </article>

        <article className="animate-pulse rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-4 sm:px-5">
          <div className="h-5 w-40 rounded bg-surface-container-high" />
          <div className="mt-4 space-y-3">
            <div className="h-16 rounded-lg bg-surface-container-high" />
            <div className="h-16 rounded-lg bg-surface-container-high" />
            <div className="h-16 rounded-lg bg-surface-container-high" />
          </div>
        </article>
      </div>
    </div>
  );
}
