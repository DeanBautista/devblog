import { useEffect, useState } from 'react';
import { getPublicHomeData } from '../../lib/public';

const FALLBACK_ARTICLES = [
  {
    id: 'fallback-1',
    title: 'Architecting Low-Latency React Environments',
    excerpt:
      'An architecture-first approach to reducing render pressure while keeping interfaces fluid under load.',
    reading_time: 12,
    views: 14200,
  },
  {
    id: 'fallback-2',
    title: 'Composable API Layers for CMS Workflows',
    excerpt:
      'Design endpoint boundaries that let writers publish quickly while keeping systems observable and safe.',
    reading_time: 10,
    views: 9700,
  },
  {
    id: 'fallback-3',
    title: 'Writing Maintainable Frontend Systems',
    excerpt:
      'Patterns for balancing velocity and clarity when a codebase grows across product teams.',
    reading_time: 8,
    views: 6200,
  },
];

function formatViews(value) {
  const numericValue = Number(value) || 0;
  if (numericValue >= 1000) {
    return `${(numericValue / 1000).toFixed(1)}K`;
  }
  return `${numericValue}`;
}

export default function Article() {
  const [articles, setArticles] = useState(FALLBACK_ARTICLES);

  useEffect(() => {
    let isMounted = true;

    async function loadArticles() {
      try {
        const response = await getPublicHomeData();
        if (!isMounted || !response?.success) {
          return;
        }

        const nextArticles = Array.isArray(response.featuredArticles) && response.featuredArticles.length > 0
          ? response.featuredArticles
          : FALLBACK_ARTICLES;

        setArticles(nextArticles);
      } catch {
        // Fallback list is already rendered.
      }
    }

    loadArticles();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-20 pt-12 md:px-8 md:pt-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Article Archive</p>
        <h1 className="mt-3 text-5xl font-semibold leading-tight tracking-tight text-on-surface">Engineering Notes for Modern Builders</h1>
        <p className="mt-5 text-base leading-relaxed text-on-surface-variant">
          A curated collection of technical essays on frontend architecture, API design, and resilient developer workflows.
        </p>
      </header>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <article
            key={article.id}
            className="rounded-2xl border border-outline-variant/30 bg-surface-container px-5 py-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
              {formatViews(article.views)} views • {article.reading_time || 0} min read
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-on-surface">{article.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{article.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
