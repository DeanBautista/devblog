const HOME_CACHE_STORAGE_KEY = 'devblog.public.home.data.v1';
const HOME_CACHE_TTL_MS = 60 * 60 * 1000;
const HOME_CACHE_VERSION = 1;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasKnownHomeFields(dataValue) {
  if (!isPlainObject(dataValue)) {
    return false;
  }

  return ['hero', 'profile', 'stats', 'featuredArticles'].some((fieldName) =>
    Object.prototype.hasOwnProperty.call(dataValue, fieldName)
  );
}

export function readHomeCache() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const rawCacheValue = window.localStorage.getItem(HOME_CACHE_STORAGE_KEY);

    if (!rawCacheValue) {
      return null;
    }

    const parsedCacheValue = JSON.parse(rawCacheValue);

    if (!isPlainObject(parsedCacheValue)) {
      return null;
    }

    if (Number(parsedCacheValue.version) !== HOME_CACHE_VERSION) {
      return null;
    }

    if (!hasKnownHomeFields(parsedCacheValue.data)) {
      return null;
    }

    const fetchedAt = Number(parsedCacheValue.fetchedAt);

    return {
      data: parsedCacheValue.data,
      fetchedAt: Number.isFinite(fetchedAt) ? fetchedAt : 0,
    };
  } catch {
    return null;
  }
}

export function writeHomeCache(data) {
  if (!canUseStorage() || !isPlainObject(data)) {
    return false;
  }

  try {
    window.localStorage.setItem(
      HOME_CACHE_STORAGE_KEY,
      JSON.stringify({
        version: HOME_CACHE_VERSION,
        fetchedAt: Date.now(),
        data,
      })
    );

    return true;
  } catch {
    return false;
  }
}

export function invalidateHomeCache() {
  if (!canUseStorage()) {
    return false;
  }

  try {
    window.localStorage.removeItem(HOME_CACHE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function isHomeCacheFresh(cacheValue, now = Date.now()) {
  if (!cacheValue || !Number.isFinite(cacheValue.fetchedAt) || cacheValue.fetchedAt <= 0) {
    return false;
  }

  const cacheAge = now - cacheValue.fetchedAt;

  if (!Number.isFinite(cacheAge) || cacheAge < 0) {
    return false;
  }

  return cacheAge < HOME_CACHE_TTL_MS;
}