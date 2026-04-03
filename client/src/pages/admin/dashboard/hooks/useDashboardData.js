import { useCallback, useEffect, useState } from 'react';
import { getAdminDashboardOverview } from '../../../../lib/dashboard';
import useAuthStore from '../../../../stores/authStore';
import {
  createEmptyDashboardData,
  extractDashboardErrorMessage,
  mapDashboardResponse,
} from '../helpers';

export default function useDashboardData() {
  const { user, accessToken } = useAuthStore();

  const [dashboardData, setDashboardData] = useState(() => createEmptyDashboardData());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const refreshDashboard = useCallback(() => {
    setRefreshNonce((previousValue) => previousValue + 1);
  }, []);

  useEffect(() => {
    if (!user || !accessToken) {
      setDashboardData(createEmptyDashboardData());
      setIsLoading(false);
      return;
    }

    let shouldIgnore = false;

    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const responseBody = await getAdminDashboardOverview();

        if (shouldIgnore) {
          return;
        }

        setDashboardData(mapDashboardResponse(responseBody));
        setLastUpdatedAt(new Date().toISOString());
      } catch (error) {
        if (shouldIgnore) {
          return;
        }

        setDashboardData(createEmptyDashboardData());
        setLoadError(extractDashboardErrorMessage(error));
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      shouldIgnore = true;
    };
  }, [user, accessToken, refreshNonce]);

  return {
    summary: dashboardData.summary,
    topArticles: dashboardData.topArticles,
    topTags: dashboardData.topTags,
    isLoading,
    loadError,
    lastUpdatedAt,
    refreshDashboard,
  };
}
