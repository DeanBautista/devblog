import { ChevronLeft, ChevronRight } from 'lucide-react';
import PublicArticleCard from '../../../components/public/PublicArticleCard';
import SearchInputWithResults from '../../../components/search/SearchInputWithResults';
import SearchResultCard from '../../../components/search/SearchResultCard';
import { ARTICLES_PER_PAGE } from './constants';
import useArticleData from './hooks/useArticleData';

export default function Article() {
    const {
        selectedTagSlug,
        searchTerm,
        setSearchTerm,
        articles,
        pagination,
        isLoading,
        areTagsLoading,
        loadError,
        searchResults,
        isSearching,
        isSearchPending,
        pageNumbers,
        shownArticlesCount,
        availableArchiveTags,
        archiveHeading,
        updatePageInUrl,
        updateTagInUrl,
    } = useArticleData();

    return (
        <section className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-12 md:px-8 md:pb-24 md:pt-16">
            <div
                className="pointer-events-none absolute left-1/2 top-12 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
                aria-hidden="true"
            />

            <div className="relative">
                <header className="relative z-40 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div className="hero-reveal hero-reveal-delay-1 max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                            The Archive
                        </p>
                        <h1 className="mt-3 text-5xl font-semibold leading-tight tracking-tight text-on-surface sm:text-6xl">
                            {archiveHeading}
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
                                    tags={article?.tags}
                                    readTime={article?.reading_time}
                                    to={article?.slug ? `/article/${encodeURIComponent(article.slug)}` : ''}
                                    index={index}
                                />
                            )}
                        />
                    </div>
                </header>

                <div className="hero-reveal hero-reveal-delay-3 mt-9 flex flex-wrap gap-2.5">
                    {availableArchiveTags.map((tagOption) => {
                        const isActive = tagOption.slug
                            ? tagOption.slug === selectedTagSlug
                            : !selectedTagSlug;

                        return (
                            <button
                                key={`archive-tag-${tagOption.slug || 'all'}`}
                                type="button"
                                onClick={() => updateTagInUrl(tagOption.slug)}
                                aria-pressed={isActive}
                                disabled={isLoading || areTagsLoading}
                                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                                    isActive
                                        ? 'border-primary-fixed bg-primary-fixed text-[#1b1f3b]'
                                        : 'border-outline-variant/40 bg-surface-container-low text-on-surface-variant'
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                                {tagOption.name}
                            </button>
                        );
                    })}
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
                            <PublicArticleCard
                                key={article.id || article.slug || index}
                                article={article}
                                index={index}
                            />
                        ))}
                </div>

                {!isLoading && loadError && (
                    <p className="mt-8 rounded-2xl border border-outline-variant/30 bg-surface-container px-5 py-4 text-sm text-on-surface-variant">
                        {loadError}
                    </p>
                )}

                {!isLoading && !loadError && articles.length === 0 && (
                    <p className="mt-8 rounded-2xl border border-outline-variant/30 bg-surface-container px-5 py-4 text-sm text-on-surface-variant">
                        {selectedTagSlug
                            ? 'No published posts found for this tag.'
                            : 'No published posts yet.'}
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
