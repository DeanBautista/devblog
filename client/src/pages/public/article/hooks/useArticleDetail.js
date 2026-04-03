import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getPublicArticleBySlug,
  getPublicArticles,
  recordPublicArticleView,
  togglePublicArticleLike,
} from '../../../../lib/public';
import { formatPublishedDate } from '../../../../utils/document-transformer';
import { normalizeSlug } from '../../../../utils/slug';
import { ARTICLE_LIKE_ACTIONS } from '../constants';
import {
  hasViewedArticle,
  isArticleLiked,
  markArticleViewed,
  setArticleLiked,
} from '../engagementStorage';

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

function formatCompactLabel(value, suffix) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return `0 ${suffix}`;
  }

  const compactValue = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
    .format(numericValue)
    .toLowerCase();

  return `${compactValue} ${suffix}`;
}

function normalizeNextPost(nextPostValue) {
  if (!nextPostValue || typeof nextPostValue !== 'object') {
    return null;
  }

  const title = typeof nextPostValue.title === 'string' ? nextPostValue.title.trim() : '';
  const slug = normalizeSlug(nextPostValue.slug);

  if (!title || !slug) {
    return null;
  }

  return {
    title,
    slug,
  };
}

function normalizeArticleDetail(articleValue) {
  const article = articleValue && typeof articleValue === 'object' ? articleValue : {};
  const publishedAtSource = article.published_at || article.created_at;
  const dateLabel = publishedAtSource ? formatPublishedDate(publishedAtSource) : 'Recently published';
  const readTime = Math.max(0, Number(article.reading_time) || 0);
  const views = Math.max(0, Number(article.views) || 0);
  const likes = Math.max(0, Number(article.likes) || 0);

  return {
    id: article.id ?? null,
    title:
      typeof article.title === 'string' && article.title.trim()
        ? article.title.trim()
        : 'Untitled post',
    slug: normalizeSlug(article.slug),
    excerpt:
      typeof article.excerpt === 'string' && article.excerpt.trim()
        ? article.excerpt.trim()
        : 'No excerpt available for this post yet.',
    content: typeof article.content === 'string' ? article.content : '',
    coverImage:
      typeof article.cover_image === 'string' && article.cover_image.trim()
        ? article.cover_image.trim()
        : null,
    tags: normalizeTagNames(article.tags),
    author: {
      name:
        typeof article.author?.name === 'string' && article.author.name.trim()
          ? article.author.name.trim()
          : 'Unknown Author',
      avatarUrl:
        typeof article.author?.avatar_url === 'string' && article.author.avatar_url.trim()
          ? article.author.avatar_url.trim()
          : null,
    },
    publishedAtLabel: dateLabel || 'Recently published',
    readTimeLabel: `${readTime} min read`,
    views,
    likes,
    viewsLabel: formatCompactLabel(views, 'views'),
    likesLabel: formatCompactLabel(likes, 'likes'),
    nextPost: normalizeNextPost(article.nextPost),
  };
}

function resolveCounterValue(value, fallbackValue) {
  const parsedValue = Number(value);

  if (Number.isFinite(parsedValue) && parsedValue >= 0) {
    return parsedValue;
  }

  return fallbackValue;
}

export default function useArticleDetail() {
  const { slug: routeSlug } = useParams();
  const normalizedRouteSlug = useMemo(() => normalizeSlug(routeSlug), [routeSlug]);

  const [article, setArticle] = useState(null);
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const activeArticleSlugRef = useRef('');

  useEffect(() => {
    activeArticleSlugRef.current = article?.slug || '';
  }, [article?.slug]);

  useEffect(() => {
    let shouldIgnore = false;

    async function loadArticleDetail() {
      setIsLoading(true);
      setLoadError('');
      setIsNotFound(false);
      setArticle(null);
      setIsLiked(false);
      setIsLikePending(false);
      setIsLikeAnimating(false);

      if (!normalizedRouteSlug) {
        setIsLoading(false);
        setIsNotFound(true);
        setLoadError('Article not found.');
        return;
      }

      try {
        const response = await getPublicArticleBySlug(normalizedRouteSlug);

        if (shouldIgnore) return;

        if (!response?.success || !response.data) {
          throw new Error('Article not found');
        }

        const normalizedArticle = normalizeArticleDetail(response.data);
        const articleSlug = normalizedArticle.slug || normalizedRouteSlug;

        setArticle(normalizedArticle);
        setIsLiked(isArticleLiked(articleSlug));

        if (articleSlug && !hasViewedArticle(articleSlug)) {
          try {
            const viewResponse = await recordPublicArticleView(articleSlug);

            if (shouldIgnore) return;

            const nextViews = resolveCounterValue(viewResponse?.data?.views, normalizedArticle.views);

            setArticle((previousArticle) => {
              if (!previousArticle || previousArticle.slug !== articleSlug) {
                return previousArticle;
              }

              return {
                ...previousArticle,
                views: nextViews,
                viewsLabel: formatCompactLabel(nextViews, 'views'),
              };
            });

            markArticleViewed(articleSlug);
          } catch {
            // Keep rendering even if view tracking request fails.
          }
        }
      } catch (error) {
        if (shouldIgnore) return;

        const statusCode = error?.response?.status;
        if (statusCode === 404 || error?.message === 'Article not found') {
          setIsNotFound(true);
          setLoadError('Article not found.');
        } else {
          setLoadError('Unable to load article right now.');
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false);
        }
      }
    }

    loadArticleDetail();

    return () => {
      shouldIgnore = true;
    };
  }, [normalizedRouteSlug]);

  const handleLikeToggle = useCallback(async () => {
    const articleSlug = article?.slug;

    if (!articleSlug || isLikePending) {
      return;
    }

    const currentLiked = isLiked;
    const nextAction = currentLiked ? ARTICLE_LIKE_ACTIONS.UNLIKE : ARTICLE_LIKE_ACTIONS.LIKE;
    const baselineLikes = Math.max(0, Number(article?.likes) || 0);

    setIsLikePending(true);

    try {
      const likeResponse = await togglePublicArticleLike(articleSlug, nextAction);
      const responseLiked =
        typeof likeResponse?.data?.liked === 'boolean' ? likeResponse.data.liked : !currentLiked;
      const fallbackLikes = Math.max(
        0,
        baselineLikes + (nextAction === ARTICLE_LIKE_ACTIONS.LIKE ? 1 : -1)
      );
      const nextLikes = resolveCounterValue(likeResponse?.data?.likes, fallbackLikes);

      if (activeArticleSlugRef.current !== articleSlug) {
        return;
      }

      setArticle((previousArticle) => {
        if (!previousArticle || previousArticle.slug !== articleSlug) {
          return previousArticle;
        }

        return {
          ...previousArticle,
          likes: nextLikes,
          likesLabel: formatCompactLabel(nextLikes, 'likes'),
        };
      });

      setIsLiked(responseLiked);
      setArticleLiked(articleSlug, responseLiked);

      if (responseLiked !== currentLiked) {
        setIsLikeAnimating(true);
      }
    } catch {
      // Keep existing state if like request fails.
    } finally {
      setIsLikePending(false);
    }
  }, [article?.likes, article?.slug, isLikePending, isLiked]);

  useEffect(() => {
    if (!isLikeAnimating || typeof window === 'undefined') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsLikeAnimating(false);
    }, 420);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLikeAnimating]);

  useEffect(() => {
    let shouldIgnore = false;

    async function loadRecommendedArticles() {
      setIsRecommendedLoading(true);
      setRecommendedArticles([]);

      if (!normalizedRouteSlug) {
        setIsRecommendedLoading(false);
        return;
      }

      try {
        const response = await getPublicArticles({
          page: 1,
          limit: 6,
        });

        if (shouldIgnore) return;

        if (!response?.success) {
          throw new Error('Unable to load recommendations.');
        }

        const rows = Array.isArray(response.data) ? response.data : [];
        const filteredRows = rows
          .filter((row) => normalizeSlug(row?.slug) !== normalizedRouteSlug)
          .slice(0, 3);

        setRecommendedArticles(filteredRows);
      } catch {
        if (shouldIgnore) return;

        setRecommendedArticles([]);
      } finally {
        if (!shouldIgnore) {
          setIsRecommendedLoading(false);
        }
      }
    }

    loadRecommendedArticles();

    return () => {
      shouldIgnore = true;
    };
  }, [normalizedRouteSlug]);

  return {
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
  };
}
