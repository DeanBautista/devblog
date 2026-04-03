import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PublicArticleCard from './PublicArticleCard';

function LatestPostsSkeletonGrid() {
  return (
    <div className="mt-10 grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <article
          key={`latest-post-skeleton-${index}`}
          className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low/70 animate-pulse"
        >
          <div className="h-44 bg-surface-container" />

          <div className="px-5 py-5">
            <span className="block h-9 w-11/12 rounded-md bg-surface-container" />
            <span className="mt-2.5 block h-3 w-4/5 rounded-md bg-surface-container" />
            <span className="mt-2 block h-3 w-3/4 rounded-md bg-surface-container" />

            <div className="mt-8 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="h-9 w-9 rounded-full bg-surface-container" />
                <span className="h-3 w-24 rounded-md bg-surface-container" />
              </div>
              <span className="h-3 w-16 rounded-md bg-surface-container" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function LatestPostsSection({ articles = [], isLoading = false }) {
  const visibleArticles = Array.isArray(articles) ? articles.slice(0, 3) : [];

  return (
    <div className="relative mx-auto w-full max-w-6xl overflow-hidden px-5 pb-16 md:px-8 md:pb-24 pt-8">
      <header className="max-w-3xl">
        <h2 className="hero-reveal hero-reveal-delay-1 text-4xl font-semibold tracking-tight text-on-surface sm:text-5xl">
          Latest Posts
        </h2>

        <div className="hero-reveal hero-reveal-delay-2 mt-4 h-0.5 w-14 rounded-full bg-primary" />

        <p className="hero-reveal hero-reveal-delay-3 mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
          Insights from the intersection of code and craft.
        </p>
      </header>

      {isLoading ? (
        <LatestPostsSkeletonGrid />
      ) : (
        <div className="mt-10 grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleArticles.map((article, index) => (
            <div
              key={article.id || article.slug || index}
              className="hero-reveal min-w-0 w-full"
              style={{ animationDelay: `${220 + index * 120}ms` }}
            >
              <PublicArticleCard article={article} index={index} />
            </div>
          ))}
        </div>
      )}

      {visibleArticles.length === 0 && !isLoading && (
        <p className="mt-6 rounded-2xl border border-outline-variant/30 bg-surface-container px-5 py-4 text-sm text-on-surface-variant">
          No published posts yet.
        </p>
      )}

      <div className="mt-10 flex justify-end">
        <Link
          to="/article"
          className="hero-reveal inline-flex items-center gap-3 rounded-full border border-outline-variant/40 bg-surface-container-low px-5 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
        >
          Explore full archive
          <ChevronRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </div>
  );
}