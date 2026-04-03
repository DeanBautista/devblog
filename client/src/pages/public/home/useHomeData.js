import { useEffect, useState } from 'react';
import { getPublicHomeData } from '../../../lib/public';
import { EMPTY_HOME_DATA } from './homeConstants';
import { isHomeCacheFresh, readHomeCache, writeHomeCache } from './homeCache';

function normalizeHomeData(responseData) {
  return {
    ...EMPTY_HOME_DATA,
    ...responseData,
    hero: { ...EMPTY_HOME_DATA.hero, ...(responseData?.hero || {}) },
    profile: { ...EMPTY_HOME_DATA.profile, ...(responseData?.profile || {}) },
    stats: { ...EMPTY_HOME_DATA.stats, ...(responseData?.stats || {}) },
    featuredArticles:
      Array.isArray(responseData?.featuredArticles) ? responseData.featuredArticles : [],
  };
}

export default function useHomeData() {
  const [cacheSnapshot] = useState(() => readHomeCache());
  const hasCachedData = Boolean(cacheSnapshot);
  const hasCachedFeaturedArticles =
    Array.isArray(cacheSnapshot?.data?.featuredArticles) &&
    cacheSnapshot.data.featuredArticles.length > 0;

  const [homeData, setHomeData] = useState(() =>
    hasCachedData ? normalizeHomeData(cacheSnapshot.data) : EMPTY_HOME_DATA
  );
  const [loading, setLoading] = useState(() => !hasCachedData);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (hasCachedData && isHomeCacheFresh(cacheSnapshot) && !hasCachedFeaturedArticles) {
      setLoading(false);
      setHasError(false);

      return () => {
        isMounted = false;
      };
    }

    async function loadHomeData() {
      try {
        const response = await getPublicHomeData();

        if (!isMounted) {
          return;
        }

        if (!response?.success) {
          if (!hasCachedData) {
            setHasError(true);
          }

          return;
        }

        const normalizedData = normalizeHomeData(response);

        setHomeData(normalizedData);
        writeHomeCache(normalizedData);
        setHasError(false);
      } catch {
        if (isMounted) {
          if (!hasCachedData) {
            setHasError(true);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, [cacheSnapshot, hasCachedData, hasCachedFeaturedArticles]);

  return {
    homeData,
    loading,
    hasError,
  };
}
