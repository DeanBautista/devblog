const HOME_CACHE_TTL_MS = 10 * 60 * 1000;
let homeCacheSnapshot = null;

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
  if (!homeCacheSnapshot || !isPlainObject(homeCacheSnapshot)) {
    return null;
  }

  const fetchedAt = Number(homeCacheSnapshot.fetchedAt);

  if (!Number.isFinite(fetchedAt) || fetchedAt <= 0 || !hasKnownHomeFields(homeCacheSnapshot.data)) {
    homeCacheSnapshot = null;
    return null;
  }

  const cacheAge = Date.now() - fetchedAt;

  if (!Number.isFinite(cacheAge) || cacheAge < 0 || cacheAge >= HOME_CACHE_TTL_MS) {
    homeCacheSnapshot = null;
    return null;
  }

  return {
    data: homeCacheSnapshot.data,
    fetchedAt,
  };
}

export function writeHomeCache(data) {
  if (!isPlainObject(data) || !hasKnownHomeFields(data)) {
    return false;
  }

  homeCacheSnapshot = {
    data,
    fetchedAt: Date.now(),
  };

  return true;
}

export function invalidateHomeCache() {
  homeCacheSnapshot = null;
  return true;
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