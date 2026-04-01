import { useEffect, useState } from 'react';
import { getPublicHomeData } from '../../../lib/public';
import { FALLBACK_HOME_DATA } from './homeConstants';

function mergeHomeData(previousData, responseData) {
  return {
    ...previousData,
    ...responseData,
    hero: { ...previousData.hero, ...(responseData.hero || {}) },
    profile: { ...previousData.profile, ...(responseData.profile || {}) },
    stats: { ...previousData.stats, ...(responseData.stats || {}) },
    featuredArticles:
      Array.isArray(responseData.featuredArticles) && responseData.featuredArticles.length > 0
        ? responseData.featuredArticles
        : previousData.featuredArticles,
  };
}

export default function useHomeData() {
  const [homeData, setHomeData] = useState(FALLBACK_HOME_DATA);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        const response = await getPublicHomeData();

        if (!isMounted || !response?.success) {
          return;
        }

        setHomeData((previousData) => mergeHomeData(previousData, response));
      } catch {
        if (isMounted) {
          setHasError(true);
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
  }, []);

  return {
    homeData,
    loading,
    hasError,
  };
}
