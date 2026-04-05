import { Link } from 'react-router-dom';

function getInitials(name) {
  if (!name) return 'OA';

  const parts = name.split(' ').filter(Boolean).slice(0, 2);
  if (parts.length === 0) return 'OA';

  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

function HomeHeroSkeleton() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ scrollSnapAlign: 'start', minHeight: '100vh' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55rem 30rem at 78% 12%, rgba(73, 75, 214, 0.17), transparent 65%), linear-gradient(180deg, rgba(11, 19, 38, 1) 0%, rgba(7, 15, 33, 1) 100%)',
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col items-center justify-center gap-10 px-5 pb-10 pt-8 sm:gap-16 sm:pb-16 sm:pt-10 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-20 lg:pt-16">
        <div className="order-2 flex w-full max-w-2xl flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
          <span className="h-3 w-36 animate-pulse rounded-full bg-surface-container-high" />
          <span className="mt-4 h-12 w-11/12 animate-pulse rounded-md bg-surface-container-high sm:h-16" />
          <span className="mt-4 h-6 w-8/12 animate-pulse rounded-md bg-surface-container-high sm:h-8" />

          <div className="mt-7 w-full max-w-xl space-y-3 sm:mt-8">
            <span className="block h-4 w-full animate-pulse rounded-md bg-surface-container-high" />
            <span className="block h-4 w-11/12 animate-pulse rounded-md bg-surface-container-high" />
            <span className="block h-4 w-9/12 animate-pulse rounded-md bg-surface-container-high" />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4 lg:justify-start">
            <span className="h-11 w-36 animate-pulse rounded-full bg-surface-container-high" />
            <span className="h-11 w-36 animate-pulse rounded-full bg-surface-container-high" />
          </div>
        </div>

        <div className="order-1 flex w-full max-w-md flex-col items-center lg:order-2 lg:max-w-lg">
          <div className="relative h-44 w-44 rounded-full border-4 border-primary/50 bg-surface-container shadow-[0_0_35px_rgba(73,75,214,0.45)] sm:h-80 sm:w-80">
            <div className="h-full w-full animate-pulse rounded-full bg-surface-container-high" />
          </div>

          <div className="mt-6 grid w-fit grid-cols-3 gap-1.5 sm:mt-8 sm:gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <article
                key={`hero-stat-skeleton-${index}`}
                className="rounded-xl border border-outline-variant/35 bg-surface-container-low/85 px-2.5 py-2 text-center sm:rounded-2xl sm:px-4 sm:py-4"
              >
                <span className="mx-auto block h-6 w-8 animate-pulse rounded-md bg-surface-container-high sm:h-7 sm:w-10" />
                <span className="mx-auto mt-2 block h-3 w-10 animate-pulse rounded-md bg-surface-container-high sm:w-12" />
              </article>
            ))}
          </div>

          <p className="mt-4 text-center text-xs font-medium uppercase tracking-[0.14em] text-on-surface-variant">
            Loading profile and publication metrics...
          </p>
        </div>
      </div>
    </section>
  );
}

export default function HomeHeroSection({ homeData, firstName, statCards, loading }) {
  if (loading) {
    return <HomeHeroSkeleton />;
  }

  const heroKicker = typeof homeData?.hero?.kicker === 'string' ? homeData.hero.kicker.trim() : '';
  const heroRole = typeof homeData?.hero?.role === 'string' ? homeData.hero.role.trim() : '';
  const profileBio = typeof homeData?.profile?.bio === 'string' ? homeData.profile.bio.trim() : '';
  const headingText = firstName ? `Hi, I'm ${firstName}` : 'Hi there';

  return (
    <section
      className="relative overflow-hidden"
      style={{ scrollSnapAlign: 'start', minHeight: '100vh' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55rem 30rem at 78% 12%, rgba(73, 75, 214, 0.17), transparent 65%), linear-gradient(180deg, rgba(11, 19, 38, 1) 0%, rgba(7, 15, 33, 1) 100%)',
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col items-center justify-center gap-10 px-5 pb-10 pt-8 sm:gap-16 sm:pb-16 sm:pt-10 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-20 lg:pt-16">
        <div className="order-2 flex max-w-2xl flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
          {heroKicker ? (
            <p className="hero-reveal hero-reveal-delay-1 text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
              {heroKicker}
            </p>
          ) : null}

          <h1 className="hero-reveal hero-reveal-delay-2 mt-3 text-4xl font-semibold leading-[1.05] tracking-tight text-on-surface sm:mt-4 sm:text-6xl md:text-7xl">
            {headingText}
          </h1>

          {heroRole ? (
            <p className="hero-reveal hero-reveal-delay-3 mt-3 text-lg font-medium text-secondary sm:mt-4 sm:text-2xl md:text-4xl">
              {heroRole}
            </p>
          ) : null}

          {profileBio ? (
            <p className="hero-reveal hero-reveal-delay-4 mt-6 mx-auto max-w-xl text-base leading-relaxed text-on-surface-variant sm:mt-8 sm:text-lg lg:mx-0">
              {profileBio}
            </p>
          ) : null}

          <div className="hero-reveal hero-reveal-delay-5 mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4 lg:justify-start">
            <Link
              to="/article"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 sm:px-7 sm:py-3.5 sm:text-base"
            >
              Read My Blog
            </Link>

            <a
              href="https://github.com/DeanBautista"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-outline-variant/50 bg-surface-container px-5 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface sm:px-7 sm:py-3.5 sm:text-base"
            >
              View GitHub
            </a>
          </div>

        </div>

        <div className="hero-reveal hero-reveal-delay-2 order-1 flex w-full max-w-md flex-col items-center lg:order-2 lg:max-w-lg">
          <div className="mx-auto w-fit">
            <div className="hero-portrait relative h-44 w-44 rounded-full border-4 border-primary/50 bg-surface-container shadow-[0_0_24px_rgba(73,75,214,0.38)] sm:h-80 sm:w-80">
              {homeData.profile?.avatar_url ? (
                <img
                  src={homeData.profile.avatar_url}
                  alt={homeData.profile?.name || 'Profile'}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-surface-container-high to-surface-container-low text-5xl font-semibold text-on-surface-variant sm:text-6xl">
                  {getInitials(homeData.profile?.name)}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid w-fit grid-cols-3 gap-1.5 sm:mt-8 sm:gap-3">
            {statCards.map((card, index) => (
              <article
                key={card.key}
                className="hero-reveal rounded-xl border border-outline-variant/35 bg-surface-container-low/85 px-2.5 py-2 text-center sm:rounded-2xl sm:px-4 sm:py-4"
                style={{ animationDelay: `${460 + index * 120}ms` }}
              >
                <p className="text-lg font-semibold leading-none text-on-surface sm:text-xl">{card.value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant sm:mt-2 sm:tracking-[0.14em]">
                  {card.label}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
