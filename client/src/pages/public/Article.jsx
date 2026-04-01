import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PublicArticleCard from '../../components/public/PublicArticleCard';
import SearchInputWithResults from '../../components/search/SearchInputWithResults';
import SearchResultCard from '../../components/search/SearchResultCard';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { getPublicArticles } from '../../lib/public';

const ARTICLES_PER_PAGE = 6;

const ARCHIVE_TAGS = ['All', 'React', 'Node.js', 'CSS', 'JavaScript'];

const DEFAULT_PAGINATION = {
  page: 1,
  limit: ARTICLES_PER_PAGE,
  total: 0,
  totalPages: 1,
  hasPrev: false,
  hasNext: false,
};

function normalizePageParam(pageParam) {
  const parsedValue = Number.parseInt(pageParam ?? '1', 10);
  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
}

function normalizePagination(apiPagination, fallbackPage) {
  const totalValue = Number.parseInt(apiPagination?.total, 10);
  const totalPagesValue = Number.parseInt(apiPagination?.totalPages, 10);
  const pageValue = normalizePageParam(apiPagination?.page ?? fallbackPage);

  return {
    page: pageValue,
    limit: ARTICLES_PER_PAGE,
    total: Number.isFinite(totalValue) && totalValue > 0 ? totalValue : 0,
    totalPages: Number.isFinite(totalPagesValue) && totalPagesValue > 0 ? totalPagesValue : 1,
    hasPrev: pageValue > 1,
    hasNext: Number.isFinite(totalPagesValue) ? pageValue < totalPagesValue : false,
  };
}

export default function Article() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = normalizePageParam(searchParams.get('page'));

  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const normalizedSearchTerm = searchTerm.trim();
  const debouncedSearchTerm = useDebouncedValue(normalizedSearchTerm, 400);
  const isSearchPending =
    normalizedSearchTerm.length >= 1 && normalizedSearchTerm !== debouncedSearchTerm;

  useEffect(() => {
    let shouldIgnore = false;

    async function loadArticles() {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await getPublicArticles({
          page: currentPage,
          limit: ARTICLES_PER_PAGE,
        });

        if (shouldIgnore) {
          return;
        }

        if (!response?.success) {
          throw new Error('Request failed');
        }

        const rows = Array.isArray(response.data) ? response.data : [];
        const nextPagination = normalizePagination(response.pagination, currentPage);

        setArticles(rows);
        setPagination(nextPagination);

        if (nextPagination.page !== currentPage) {
          const nextParams = new URLSearchParams();
          nextParams.set('page', String(nextPagination.page));
          setSearchParams(nextParams);
        }
      } catch {
        if (shouldIgnore) {
          return;
        }

        setArticles([]);
        setPagination({
          page: currentPage,
          limit: ARTICLES_PER_PAGE,
          total: 0,
          totalPages: 1,
          hasPrev: currentPage > 1,
          hasNext: false,
        });
        setLoadError('Unable to load articles right now.');
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false);
        }
      }
    }

    loadArticles();

    return () => {
      shouldIgnore = true;
    };
  }, [currentPage, setSearchParams]);

  useEffect(() => {
    let shouldIgnore = false;
    const normalizedQuery = debouncedSearchTerm.trim();

    if (normalizedQuery.length < 1) {
      setSearchResults([]);
      setIsSearching(false);
      return () => {
        shouldIgnore = true;
      };
    }

    async function loadSearchResults() {
      setIsSearching(true);

      try {
        const response = await getPublicArticles({
          page: 1,
          limit: 5,
          q: normalizedQuery,
        });

        if (shouldIgnore) {
          return;
        }

        if (!response?.success) {
          throw new Error('Search request failed');
        }

        const rows = Array.isArray(response.data) ? response.data : [];
        setSearchResults(rows);
      } catch {
        if (shouldIgnore) {
          return;
        }

        setSearchResults([]);
      } finally {
        if (!shouldIgnore) {
          setIsSearching(false);
        }
      }
    }

    loadSearchResults();

    return () => {
      shouldIgnore = true;
    };
  }, [debouncedSearchTerm]);

  const pageNumbers = useMemo(
    () => Array.from({ length: pagination.totalPages }, (_, index) => index + 1),
    [pagination.totalPages]
  );

  const shownArticlesCount = useMemo(() => {
    if (pagination.total < 1) {
      return 0;
    }

    const cumulativeCount = (pagination.page - 1) * pagination.limit + articles.length;
    return Math.min(cumulativeCount, pagination.total);
  }, [articles.length, pagination.limit, pagination.page, pagination.total]);

  function updatePageInUrl(nextPage) {
    const boundedPage = Math.min(Math.max(nextPage, 1), pagination.totalPages);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(boundedPage));
    setSearchParams(nextParams);
  }

  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-12 md:px-8 md:pb-24 md:pt-16">
      <div className="pointer-events-none absolute left-1/2 top-12 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

      <div className="relative">
        <header className="relative z-40 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="hero-reveal hero-reveal-delay-1 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">The Archive</p>
            <h1 className="mt-3 text-5xl font-semibold leading-tight tracking-tight text-on-surface sm:text-6xl">
              All Posts
            </h1>
          </div>

          <div className="hero-reveal hero-reveal-delay-2 relative z-50 w-full max-w-sm">
            <SearchInputWithResults
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search articles..."
              results={isSearchPending ? [] : searchResults}
              isLoading={isSearchPending || isSearching}
              loadingLabel="Searching articles..."
              emptyLabel="No matching articles found."
              wrapperClassName="w-full"
              renderResult={(article, index) => (
                <SearchResultCard
                  key={`public-article-search-${article.id || article.slug || index}`}
                  title={article?.title}
                  imageSrc={article?.cover_image}
                  index={index}
                />
              )}
            />
          </div>
        </header>

        <div className="hero-reveal hero-reveal-delay-3 mt-9 flex flex-wrap gap-2.5">
          {ARCHIVE_TAGS.map((tagLabel, index) => (
            <button
              key={tagLabel}
              type="button"
              aria-disabled="true"
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                index === 0
                  ? 'border-primary-fixed bg-primary-fixed text-[#1b1f3b]'
                  : 'border-outline-variant/40 bg-surface-container-low text-on-surface-variant'
              }`}
            >
              {tagLabel}
            </button>
          ))}
        </div>

        <div className="hero-reveal hero-reveal-delay-4 mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {isLoading &&
            Array.from({ length: ARTICLES_PER_PAGE }, (_, index) => (
              <article
                key={`archive-loading-${index}`}
                className="h-108 animate-pulse rounded-2xl border border-outline-variant/30 bg-surface-container"
              />
            ))}

          {!isLoading &&
            articles.map((article, index) => (
              <PublicArticleCard key={article.id || article.slug || index} article={article} index={index} />
            ))}
        </div>

        {!isLoading && loadError && (
          <p className="mt-8 rounded-2xl border border-outline-variant/30 bg-surface-container px-5 py-4 text-sm text-on-surface-variant">
            {loadError}
          </p>
        )}

        {!isLoading && !loadError && articles.length === 0 && (
          <p className="mt-8 rounded-2xl border border-outline-variant/30 bg-surface-container px-5 py-4 text-sm text-on-surface-variant">
            No published posts yet.
          </p>
        )}

        {!loadError && (
          <div className="hero-reveal hero-reveal-delay-5 mt-12 flex flex-col items-center gap-4 pb-2 text-xs text-on-surface-variant sm:flex-row sm:justify-between">
            <p>
              {isLoading
                ? 'Loading articles...'
                : `Showing ${shownArticlesCount} of ${pagination.total} articles`}
            </p>

            <nav className="flex items-center gap-2" aria-label="Archive pagination">
              <button
                type="button"
                onClick={() => updatePageInUrl(pagination.page - 1)}
                disabled={isLoading || !pagination.hasPrev}
                className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={14} aria-hidden="true" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => updatePageInUrl(page)}
                  disabled={isLoading}
                  className={`h-9 w-9 rounded-lg border text-sm font-medium ${
                    page === pagination.page
                      ? 'border-primary-fixed bg-primary-fixed text-[#1b1f3b]'
                      : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => updatePageInUrl(pagination.page + 1)}
                disabled={isLoading || !pagination.hasNext}
                className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
}
