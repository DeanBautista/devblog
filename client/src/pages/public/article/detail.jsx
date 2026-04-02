import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Eye, Share2, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DocumentRenderer from '../../../components/document_renderer/DocumentRenderer';
import useArticleDetail from './hooks/useArticleDetail';

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

function CoverFallback({ title }) {
  return (
    <div className="relative h-full w-full bg-linear-to-br from-[#0f4a56] via-[#0d2f42] to-[#07182c]">
      <div className="absolute inset-0 bg-linear-to-r from-black/5 via-transparent to-black/20" />
      <div className="absolute right-8 top-8 h-28 w-28 rounded-full bg-primary/15 blur-2xl" />
      <span className="sr-only">{title} cover image</span>
    </div>
  );
}

function ArticleDetailSkeleton() {
  return (
    <article className="animate-pulse">
      <div className="h-56 w-full rounded-2xl bg-surface-container md:h-80 lg:h-105" />
      <div className="mt-6 flex gap-2">
        <span className="h-6 w-20 rounded-full bg-surface-container" />
        <span className="h-6 w-24 rounded-full bg-surface-container" />
      </div>
      <span className="mt-6 block h-10 w-11/12 rounded-md bg-surface-container" />
      <span className="mt-3 block h-10 w-4/5 rounded-md bg-surface-container" />
      <div className="mt-6 flex gap-2">
        <span className="h-8 w-40 rounded-md bg-surface-container" />
        <span className="h-8 w-28 rounded-md bg-surface-container" />
      </div>
      <span className="mt-8 block h-4 w-full rounded-md bg-surface-container" />
      <span className="mt-3 block h-4 w-11/12 rounded-md bg-surface-container" />
      <span className="mt-3 block h-4 w-10/12 rounded-md bg-surface-container" />
      <div className="mt-10 h-48 rounded-xl bg-surface-container" />
    </article>
  );
}

export default function ArticleDetail() {
  const navigate = useNavigate();
  const { article, isLoading, loadError, isNotFound } = useArticleDetail();

  const handleBackClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/article');
  };

  if (isLoading) {
    return (
      <section className="relative mx-auto w-full max-w-5xl px-5 pb-20 pt-12 md:px-8 md:pb-24 md:pt-16">
        <button
          type="button"
          onClick={handleBackClick}
          className="hero-reveal inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/35 bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container"
          aria-label="Go back"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <ArticleDetailSkeleton />
      </section>
    );
  }

  if (!article) {
    return (
      <section className="relative mx-auto w-full max-w-5xl px-5 pb-20 pt-12 md:px-8 md:pb-24 md:pt-16">
        <button
          type="button"
          onClick={handleBackClick}
          className="hero-reveal inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/35 bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container"
          aria-label="Go back"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <article className="rounded-2xl border border-outline-variant/30 bg-surface-container-low px-5 py-10 text-center sm:px-8">
          <h1 className="text-2xl font-semibold text-on-surface">
            {isNotFound ? 'Post not found' : 'Unable to load post'}
          </h1>
          <p className="mt-3 text-sm text-on-surface-variant">{loadError || 'Please try again in a moment.'}</p>
        </article>
      </section>
    );
  }

  const hasContent = typeof article.content === 'string' && article.content.trim().length > 0;
  const nextPostTitle = article.nextPost?.title || 'No next post available';

  return (
    <section className="relative mx-auto w-full max-w-5xl px-5 pb-20 pt-10 md:px-8 md:pb-24 md:pt-14">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-linear-to-b"
        aria-hidden="true"
      />

      <article className="relative">
        <div className="hero-reveal overflow-hidden rounded-2xl border border-outline-variant/30">
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-56 w-full object-cover md:h-80 lg:h-105"
              loading="lazy"
            />
          ) : (
            <div className="h-56 md:h-80 lg:h-105">
              <CoverFallback title={article.title} />
            </div>
          )}
          <button
            type="button"
            onClick={handleBackClick}
            className="absolute top-2 left-2 hero-reveal inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/35 bg-surface-container-low text-on-surface transition-colors hover:bg-surface-container"
            aria-label="Go back"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
        </div>

        {article.tags.length > 0 ? (
          <div className="hero-reveal hero-reveal-delay-1 mt-6 flex flex-wrap items-center gap-2">
            {article.tags.map((tagName, index) => (
              <span
                key={`detail-tag-${tagName}-${index}`}
                className="rounded-full border border-outline-variant/45 bg-surface-container-low px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant"
              >
                #{tagName}
              </span>
            ))}
          </div>
        ) : null}

        <h1 className="hero-reveal hero-reveal-delay-2 mt-5 text-4xl font-semibold leading-[1.03] tracking-tight text-on-surface sm:text-5xl md:text-6xl">
          {article.title}
        </h1>

        <div className="hero-reveal hero-reveal-delay-3 mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-on-surface-variant md:text-sm">
          <div className="min-w-0 flex items-center gap-3 pr-2">
            {article.author.avatarUrl ? (
              <img
                src={article.author.avatarUrl}
                alt={article.author.name}
                className="h-10 w-10 rounded-full border border-outline-variant/30 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container text-xs font-semibold text-on-surface-variant">
                {getInitials(article.author.name)}
              </div>
            )}
            <span className="truncate text-sm font-medium text-on-surface">{article.author.name}</span>
          </div>

          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} aria-hidden="true" />
            <span>{article.publishedAtLabel}</span>
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} aria-hidden="true" />
            <span>{article.readTimeLabel}</span>
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Eye size={14} aria-hidden="true" />
            <span>{article.viewsLabel}</span>
          </span>
        </div>

        <div className="hero-reveal hero-reveal-delay-5 mt-2 pt-0">
          {hasContent ? (
            <DocumentRenderer value={article.content} />
          ) : (
            <p className="mt-8 text-sm text-on-surface-variant">Detailed content is not available for this post yet.</p>
          )}
        </div>

        <div className="hero-reveal hero-reveal-delay-5 mt-12 border-t border-outline-variant/30 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant/35 bg-surface-container-low px-4 py-2 text-sm font-medium text-on-surface-variant disabled:cursor-default disabled:opacity-80"
              >
                <ThumbsUp size={15} aria-hidden="true" />
                <span>{article.likesLabel}</span>
              </button>

              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant/35 bg-surface-container-low px-4 py-2 text-sm font-medium text-on-surface-variant disabled:cursor-default disabled:opacity-80"
              >
                <Share2 size={15} aria-hidden="true" />
                <span>Share</span>
              </button>
            </div>

            <button
              type="button"
              disabled
              className="w-full rounded-xl border border-outline-variant/35 bg-surface-container-low px-4 py-3 text-left disabled:cursor-default disabled:opacity-80 sm:w-auto sm:max-w-[18rem]"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                Next Post
              </span>
              <span className="mt-1.5 inline-flex items-center gap-2 text-sm font-semibold text-on-surface">
                {nextPostTitle}
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
