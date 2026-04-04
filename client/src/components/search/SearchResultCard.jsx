import { Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK_COVERS = [
  'from-[#86d6c3] via-[#68bea9] to-[#4f9c89]',
  'from-[#95a3b8] via-[#728099] to-[#56627a]',
  'from-[#d8c39a] via-[#bea377] to-[#a18057]',
  'from-[#6ea9c4] via-[#588aa5] to-[#3f677d]',
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

function formatReadTime(readTimeValue) {
  const parsedReadTime = Number.parseInt(readTimeValue, 10);

  if (!Number.isFinite(parsedReadTime) || parsedReadTime < 1) {
    return '';
  }

  return `${parsedReadTime} min read`;
}

export default function SearchResultCard({
  title,
  imageSrc,
  tags,
  readTime,
  index = 0,
  to = '',
  onEdit,
  onDelete,
  isDeleting = false,
}) {
  const coverVariant = FALLBACK_COVERS[index % FALLBACK_COVERS.length];
  const normalizedTitle = title?.trim() || 'Untitled post';
  const normalizedPath = typeof to === 'string' ? to.trim() : '';
  const tagNames = normalizeTagNames(tags).slice(0, 2);
  const subtitle = [...tagNames, formatReadTime(readTime)].filter(Boolean).join(' • ');
  const hasEditAction = typeof onEdit === 'function';
  const hasDeleteAction = typeof onDelete === 'function';
  const shouldShowActions = hasEditAction || hasDeleteAction;

  const handleEditClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDeleting || !hasEditAction) {
      return;
    }

    onEdit();
  };

  const handleDeleteClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDeleting || !hasDeleteAction) {
      return;
    }

    onDelete();
  };

  const cardContent = (
    <article className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low/70 px-3 py-2.5">
      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-outline-variant/25 bg-surface-container-high">
        {imageSrc ? (
          <img src={imageSrc} alt={normalizedTitle} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className={`h-full w-full bg-linear-to-br ${coverVariant}`} aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-semibold leading-snug text-on-surface"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {normalizedTitle}
        </p>

        {subtitle ? (
          <p className="mt-1 truncate text-[11px] font-medium text-on-surface-variant">{subtitle}</p>
        ) : null}
      </div>

      {shouldShowActions ? (
        <div className="flex shrink-0 items-center gap-1">
          {hasEditAction ? (
            <button
              type="button"
              onClick={handleEditClick}
              disabled={isDeleting}
              className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Edit ${normalizedTitle}`}
            >
              <Edit size={14} />
            </button>
          ) : null}

          {hasDeleteAction ? (
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Delete ${normalizedTitle}`}
            >
              <Trash2 size={14} />
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );

  if (!normalizedPath || shouldShowActions) {
    return cardContent;
  }

  return (
    <Link
      to={normalizedPath}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Open ${normalizedTitle}`}
    >
      {cardContent}
    </Link>
  );
}
