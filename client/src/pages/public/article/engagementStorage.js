import { ARTICLE_ENGAGEMENT_STORAGE_KEYS } from './constants';
import { normalizeSlug } from '../../../utils/slug';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStorageMap(storageKey) {
  if (!canUseStorage()) {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);

    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return {};
    }

    return parsedValue;
  } catch {
    return {};
  }
}

function writeStorageMap(storageKey, nextMap) {
  if (!canUseStorage()) {
    return false;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(nextMap));
    return true;
  } catch {
    return false;
  }
}

function normalizeArticleKey(slugValue) {
  return normalizeSlug(typeof slugValue === 'string' ? slugValue.trim() : '');
}

export function hasViewedArticle(slugValue) {
  const articleKey = normalizeArticleKey(slugValue);

  if (!articleKey) {
    return false;
  }

  const viewedMap = readStorageMap(ARTICLE_ENGAGEMENT_STORAGE_KEYS.viewedArticles);
  return Boolean(viewedMap[articleKey]);
}

export function markArticleViewed(slugValue) {
  const articleKey = normalizeArticleKey(slugValue);

  if (!articleKey) {
    return false;
  }

  const viewedMap = readStorageMap(ARTICLE_ENGAGEMENT_STORAGE_KEYS.viewedArticles);
  const nextViewedMap = {
    ...viewedMap,
    [articleKey]: Date.now(),
  };

  return writeStorageMap(ARTICLE_ENGAGEMENT_STORAGE_KEYS.viewedArticles, nextViewedMap);
}

export function isArticleLiked(slugValue) {
  const articleKey = normalizeArticleKey(slugValue);

  if (!articleKey) {
    return false;
  }

  const likedMap = readStorageMap(ARTICLE_ENGAGEMENT_STORAGE_KEYS.likedArticles);
  return Boolean(likedMap[articleKey]);
}

export function setArticleLiked(slugValue, isLiked) {
  const articleKey = normalizeArticleKey(slugValue);

  if (!articleKey) {
    return false;
  }

  const likedMap = readStorageMap(ARTICLE_ENGAGEMENT_STORAGE_KEYS.likedArticles);
  const nextLikedMap = {
    ...likedMap,
  };

  if (isLiked) {
    nextLikedMap[articleKey] = Date.now();
  } else {
    delete nextLikedMap[articleKey];
  }

  return writeStorageMap(ARTICLE_ENGAGEMENT_STORAGE_KEYS.likedArticles, nextLikedMap);
}
