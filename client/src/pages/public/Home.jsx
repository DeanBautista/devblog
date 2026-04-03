import { useMemo } from 'react';
import LatestPostsSection from '../../components/public/LatestPostsSection';
import PublicFooter from '../../components/public/PublicFooter';
import HomeHeroSection from '../../components/public/home/HomeHeroSection';
import { HOME_SCROLL_PADDING_TOP } from './home/homeConstants';
import { formatMetricValue, getFirstName } from './home/homeHelpers';
import useHomeData from './home/useHomeData';
import useRootScrollSnap from './home/useRootScrollSnap';

export default function Home() {
  useRootScrollSnap({
    snapType: 'y mandatory',
    overflowY: 'scroll',
    scrollPaddingTop: HOME_SCROLL_PADDING_TOP,
  });

  const { homeData, loading, hasError } = useHomeData();

  const firstName = useMemo(() => {
    return getFirstName(homeData.profile?.name);
  }, [homeData.profile?.name]);

  const statCards = [
    { label: 'Articles', value: formatMetricValue(homeData.stats?.articles), key: 'articles' },
    { label: 'Views',    value: formatMetricValue(homeData.stats?.views),    key: 'views'    },
    { label: 'Tags',     value: formatMetricValue(homeData.stats?.tags),     key: 'tags'     },
  ];

  return (
    <>
      <HomeHeroSection
        homeData={homeData}
        firstName={firstName}
        statCards={statCards}
        loading={loading}
        hasError={hasError}
      />

      {/* ── Section 2: Latest Posts ───────────────────────────────────────── */}
      <section className="flex flex-col" style={{ scrollSnapAlign: 'start', minHeight: '100vh' }}>
        <div className="flex-1">
          <LatestPostsSection articles={homeData.featuredArticles} isLoading={loading} />
        </div>
        <PublicFooter />
      </section>
    </>
  );
}