import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicArticleBySlug, getPublicArticles } from '../../../../lib/public';
import { formatPublishedDate } from '../../../../utils/document-transformer';
import { normalizeSlug } from '../../../../utils/slug';

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
    viewsLabel: formatCompactLabel(views, 'views'),
    likesLabel: formatCompactLabel(likes, 'likes'),
    nextPost: normalizeNextPost(article.nextPost),
  };
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

  useEffect(() => {
    let shouldIgnore = false;

    async function loadArticleDetail() {
      setIsLoading(true);
      setLoadError('');
      setIsNotFound(false);
      setArticle(null);

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

        setArticle(normalizeArticleDetail(response.data));
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
  };
}
