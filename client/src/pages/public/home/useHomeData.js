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
  const hasCachedData = Boolean(cacheSnapshot) && isHomeCacheFresh(cacheSnapshot);

  const [homeData, setHomeData] = useState(() =>
    hasCachedData ? normalizeHomeData(cacheSnapshot.data) : EMPTY_HOME_DATA
  );
  const [loading, setLoading] = useState(() => !hasCachedData);

  useEffect(() => {
    let isMounted = true;
    let isRequestSuccessful = false;

    async function loadHomeData() {
      if (!hasCachedData && isMounted) {
        setLoading(true);
      }

      try {
        const response = await getPublicHomeData();

        if (!isMounted) {
          return;
        }

        if (!response?.success) {
          return;
        }

        const normalizedData = normalizeHomeData(response);

        setHomeData(normalizedData);
        writeHomeCache(normalizedData);
        isRequestSuccessful = true;
      } catch {
        // Keep skeleton state when no cache and request fails.
      } finally {
        if (isMounted && !hasCachedData && isRequestSuccessful) {
          setLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, [hasCachedData]);

  return {
    homeData,
    loading,
  };
}
