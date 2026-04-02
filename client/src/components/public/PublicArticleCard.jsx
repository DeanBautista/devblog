import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK_COVER_STYLES = [
  'from-[#7fc7d1] via-[#66b9c8] to-[#4b95aa]',
  'from-[#7fa5bf] via-[#5f7f97] to-[#425f73]',
  'from-[#73a7b2] via-[#5f95a3] to-[#4e7f90]',
];

function normalizeTagNames(tagsValue) {
  if (!Array.isArray(tagsValue)) {
    return [];
  }

  const normalizedTagNames = tagsValue
    .map((tagValue) => {
      if (typeof tagValue === 'string') {
        return tagValue.trim();
      }

      if (tagValue && typeof tagValue.name === 'string') {
        return tagValue.name.trim();
      }

      return '';
    })
    .filter(Boolean);

  return Array.from(new Set(normalizedTagNames));
}

function formatPublishedDate(publishedAt, createdAt) {
  const sourceDate = publishedAt || createdAt;

  if (!sourceDate) {
    return 'Recently published';
  }

  const parsedDate = new Date(sourceDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Recently published';
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function getInitials(name) {
  if (!name) return 'OA';

  const parts = String(name)
    .split(' ')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return 'OA';
  }

  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

export default function PublicArticleCard({ article, index = 0 }) {
  const coverStyle = FALLBACK_COVER_STYLES[index % FALLBACK_COVER_STYLES.length];
  const title = article?.title || 'Untitled post';
  const normalizedSlug = typeof article?.slug === 'string' ? article.slug.trim() : '';
  const detailPath = normalizedSlug ? `/article/${encodeURIComponent(normalizedSlug)}` : '';
  const excerpt = article?.excerpt || 'No excerpt available for this post yet.';
  const authorName = article?.author?.name || 'Unknown Author';
  const authorAvatar = article?.author?.avatar_url || null;
  const readTime = Number(article?.reading_time) || 0;
  const dateLabel = formatPublishedDate(article?.published_at, article?.created_at);
  const tagNames = normalizeTagNames(article?.tags);
  const imageTagNames = tagNames.slice(0, 3);

  const cardContent = (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container shadow-[0_14px_38px_rgba(3,8,24,0.32)] transition-transform duration-300 hover:-translate-y-1.5">
      <div className="relative h-44 overflow-hidden bg-surface-container-high">
        {article?.cover_image ? (
          <img
            src={article.cover_image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className={`h-full w-full bg-linear-to-br ${coverStyle}`}>
            <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-black/15" />
            <div className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-white/35 blur-md" />
          </div>
        )}

        {imageTagNames.length > 0 ? (
          <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-1.5">
            {imageTagNames.map((tagName) => (
              <span
                key={`${article?.id || article?.slug || title}-image-tag-${tagName}`}
                className="rounded-full border border-background/30 bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface"
              >
                #{tagName}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-5 py-5">
        <h3 className="text-3xl font-semibold leading-tight text-on-surface">{title}</h3>

        <p
          className="mt-3 text-sm leading-relaxed text-on-surface-variant"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {excerpt}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-2.5">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="h-9 w-9 rounded-full border border-outline-variant/30 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container-high text-xs font-semibold text-on-surface-variant">
                {getInitials(authorName)}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-on-surface">{authorName}</p>
              <p className="text-xs text-on-surface-variant">{dateLabel}</p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-[11px] font-semibold text-on-surface-variant">
            <Clock size={14} aria-hidden="true" />
            <span>{readTime} min read</span>
          </div>
        </div>
      </div>
    </article>
  );

  if (!detailPath) {
    return cardContent;
  }

  return (
    <Link
      to={detailPath}
      className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Open ${title}`}
    >
      {cardContent}
    </Link>
  );
}
