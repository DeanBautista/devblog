export const DASHBOARD_DEFAULT_SUMMARY = Object.freeze({
  totalPosts: 0,
  publishedPosts: 0,
  draftPosts: 0,
  totalViews: 0,
  totalLikes: 0,
  totalTagViews: 0,
});

export const DASHBOARD_METRICS = [
  {
    key: 'totalPosts',
    label: 'Total Posts',
    caption: 'Published and drafts',
  },
  {
    key: 'publishedPosts',
    label: 'Published Posts',
    caption: 'Visible to readers',
  },
  {
    key: 'draftPosts',
    label: 'Draft Posts',
    caption: 'Work in progress',
  },
  {
    key: 'totalViews',
    label: 'Total Views',
    caption: 'All post views',
  },
  {
    key: 'totalLikes',
    label: 'Total Likes',
    caption: 'All post likes',
  },
  {
    key: 'totalTagViews',
    label: 'Total Tag Views',
    caption: 'Summed across tag links',
  },
];

export const DASHBOARD_SKELETON_METRIC_KEYS = DASHBOARD_METRICS.map(
  (metric) => `dashboard-skeleton-${metric.key}`
);

export const DASHBOARD_FALLBACK_ERROR_MESSAGE = 'Unable to load dashboard data right now.';
