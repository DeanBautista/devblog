import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Eye, Github, Linkedin, Share2, ThumbsUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DocumentRenderer from '../../../components/document_renderer/DocumentRenderer';
import PublicArticleCard from '../../../components/public/PublicArticleCard';
import useArticleDetail from './hooks/useArticleDetail';

const AUTHOR_GITHUB_URL = 'https://github.com/DeanBautista';
const AUTHOR_LINKEDIN_URL = 'https://www.linkedin.com/in/dean-paolo-bautista-6145083ba/';
const SHARE_FEEDBACK_DURATION_MS = 2000;

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

function RecommendationsSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <article
          key={`recommended-loading-${index}`}
          className="h-108 animate-pulse rounded-2xl border border-outline-variant/30 bg-surface-container"
        />
      ))}
    </div>
  );
}

function copyWithExecCommand(text) {
  if (typeof document === 'undefined' || !document.body) {
    return false;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  textArea.style.pointerEvents = 'none';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let copied = false;

  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }

  document.body.removeChild(textArea);

  return copied;
}

export default function ArticleDetail() {
  const navigate = useNavigate();
  const shareResetTimeoutRef = useRef(null);
  const [isShareCopied, setIsShareCopied] = useState(false);

  const {
    article,
    recommendedArticles,
    isLoading,
    isRecommendedLoading,
    loadError,
    isNotFound,
    isLiked,
    isLikePending,
    isLikeAnimating,
    handleLikeToggle,
  } = useArticleDetail();

  useEffect(() => {
    return () => {
      if (typeof window === 'undefined' || shareResetTimeoutRef.current === null) {
        return;
      }

      window.clearTimeout(shareResetTimeoutRef.current);
    };
  }, []);

  const nextPostSlug = article?.nextPost?.slug || '';
  const nextPostTitle = article?.nextPost?.title || 'No next post available';
  const hasNextPost = Boolean(nextPostSlug);

  const scheduleShareReset = () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (shareResetTimeoutRef.current !== null) {
      window.clearTimeout(shareResetTimeoutRef.current);
    }

    shareResetTimeoutRef.current = window.setTimeout(() => {
      setIsShareCopied(false);
      shareResetTimeoutRef.current = null;
    }, SHARE_FEEDBACK_DURATION_MS);
  };

  const handleShareClick = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const currentUrl = window.location.href;

    if (!currentUrl) {
      return;
    }

    let copied = false;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(currentUrl);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      copied = copyWithExecCommand(currentUrl);
    }

    if (!copied) {
      return;
    }

    setIsShareCopied(true);
    scheduleShareReset();
  };

  const handleNextPostClick = () => {
    if (!hasNextPost) {
      return;
    }

    navigate(`/article/${encodeURIComponent(nextPostSlug)}`);
  };

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
  const authorBio =
    'Senior Systems Architect specializing in low-level obsidian frameworks and high-concurrency developer tooling. Obsessed with terminal aesthetics and minimalist infrastructure.';

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

        <div className="hero-reveal hero-reveal-delay-3 mt-6 flex flex-col gap-4.5 text-[11px] text-on-surface-variant sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 sm:text-xs md:text-sm">
          <div className="min-w-0 flex items-center gap-2.5 sm:gap-3">
            {article.author.avatarUrl ? (
              <img
                src={article.author.avatarUrl}
                alt={article.author.name}
                className="h-9 w-9 rounded-full border border-outline-variant/30 object-cover sm:h-10 sm:w-10"
                loading="lazy"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container text-xs font-semibold text-on-surface-variant sm:h-10 sm:w-10">
                {getInitials(article.author.name)}
              </div>
            )}
            <span className="truncate text-sm font-medium text-on-surface">{article.author.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:gap-x-4">
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
                onClick={handleLikeToggle}
                disabled={isLikePending}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
                  isLiked
                    ? 'border-primary/45 bg-primary/15 text-on-surface'
                    : 'border-outline-variant/35 bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <ThumbsUp
                  size={15}
                  aria-hidden="true"
                  className={`${isLiked ? 'fill-current' : ''} ${isLikeAnimating ? 'article-like-bounce' : ''}`}
                />
                <span>{article.likesLabel}</span>
              </button>

              <button
                type="button"
                onClick={handleShareClick}
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant/35 bg-surface-container-low px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                {isShareCopied ? <Check size={15} aria-hidden="true" /> : <Share2 size={15} aria-hidden="true" />}
                <span>Share</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextPostClick}
              disabled={!hasNextPost}
              className={`group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-2xl border border-outline-variant/35 bg-surface-container-low px-5 py-4 text-left transition-colors sm:w-auto sm:min-w-[20rem] sm:max-w-88 ${
                hasNextPost ? 'hover:border-primary/45 hover:bg-surface-container' : 'cursor-default opacity-80'
              }`}
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">
                  <ArrowRight size={10} aria-hidden="true" />
                  Next Post
                </span>
                <span className="truncate text-sm font-semibold text-on-surface">
                  {nextPostTitle}
                </span>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-outline-variant/35 bg-surface-container text-on-surface-variant">
                <ArrowRight size={15} aria-hidden="true" />
              </div>
            </button>
          </div>
        </div>

       <section className="hero-reveal hero-reveal-delay-5 mt-14 rounded-2xl border border-outline-variant/30 bg-surface-container-low px-5 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {article.author.avatarUrl ? (
              <img
                src={article.author.avatarUrl}
                alt={article.author.name}
                className="h-16 w-16 rounded-full border border-outline-variant/30 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container text-lg font-semibold text-on-surface-variant">
                {getInitials(article.author.name)}
              </div>
            )}

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Author</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">{article.author.name}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant sm:text-base">{authorBio}</p>

              <div className="mt-5 flex flex-wrap justify-center gap-2.5 sm:justify-start">
                <a
                  href={AUTHOR_GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant/35 bg-surface-container px-4 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:border-primary/45 hover:text-on-surface"
                >
                  <Github size={14} aria-hidden="true" />
                  <span>GitHub</span>
                </a>

                <a
                  href={AUTHOR_LINKEDIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant/35 bg-surface-container px-4 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:border-primary/45 hover:text-on-surface"
                >
                  <Linkedin size={14} aria-hidden="true" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="hero-reveal hero-reveal-delay-5 mt-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-on-surface sm:text-4xl">You Might Also Like</h2>
            <Link
              to="/article"
              className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
            >
              <span>View all articles</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-7">
            {isRecommendedLoading ? (
              <RecommendationsSkeleton />
            ) : recommendedArticles.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {recommendedArticles.map((recommendedArticle, index) => (
                  <PublicArticleCard
                    key={recommendedArticle.id || recommendedArticle.slug || index}
                    article={recommendedArticle}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-outline-variant/30 bg-surface-container px-5 py-4 text-sm text-on-surface-variant">
                No additional articles to recommend right now.
              </p>
            )}
          </div>
        </section>
      </article>
    </section>
  );
}
