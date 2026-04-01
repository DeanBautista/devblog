import { Link } from 'react-router-dom';

function getInitials(name) {
  if (!name) return 'OA';

  const parts = name.split(' ').filter(Boolean).slice(0, 2);
  if (parts.length === 0) return 'OA';

  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

export default function HomeHeroSection({ homeData, firstName, statCards, loading, hasError }) {
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

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col items-center justify-center gap-16 px-5 pb-16 pt-10 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-20 lg:pt-16">
        <div className="order-2 flex max-w-2xl flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
          <p className="hero-reveal hero-reveal-delay-1 text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
            {homeData.hero?.kicker}
          </p>

          <h1 className="hero-reveal hero-reveal-delay-2 mt-4 text-5xl font-semibold leading-[1.05] tracking-tight text-on-surface sm:text-6xl md:text-7xl">
            Hi, I&apos;m {firstName}
          </h1>

          <p className="hero-reveal hero-reveal-delay-3 mt-4 text-2xl font-medium text-secondary md:text-4xl">
            {homeData.hero?.role}
          </p>

          <p className="hero-reveal hero-reveal-delay-4 mt-8 mx-auto max-w-xl text-lg leading-relaxed text-on-surface-variant lg:mx-0">
            {homeData.profile?.bio}
          </p>

          <div className="hero-reveal hero-reveal-delay-5 mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link
              to="/article"
              className="rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Read My Blog
            </Link>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-outline-variant/50 bg-surface-container px-7 py-3.5 text-base font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
            >
              View GitHub
            </a>
          </div>

          {hasError && (
            <p className="mt-4 text-sm text-error">
              Live data is temporarily unavailable. Showing fallback profile data.
            </p>
          )}
        </div>

        <div className="hero-reveal hero-reveal-delay-2 order-1 flex w-full max-w-md flex-col items-center lg:order-2 lg:max-w-lg">
          <div className="mx-auto w-fit">
            <div className="hero-portrait relative h-72 w-72 rounded-full border-4 border-primary/50 bg-surface-container shadow-[0_0_35px_rgba(73,75,214,0.45)] sm:h-80 sm:w-80">
              {homeData.profile?.avatar_url ? (
                <img
                  src={homeData.profile.avatar_url}
                  alt={homeData.profile?.name || 'Profile'}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-surface-container-high to-surface-container-low text-6xl font-semibold text-on-surface-variant">
                  {getInitials(homeData.profile?.name)}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {statCards.map((card, index) => (
              <article
                key={card.key}
                className="hero-reveal rounded-2xl border border-outline-variant/35 bg-surface-container-low/85 px-4 py-4 text-center"
                style={{ animationDelay: `${260 + index * 110}ms` }}
              >
                <p className="text-3xl font-semibold leading-none text-on-surface">{card.value}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                  {card.label}
                </p>
              </article>
            ))}
          </div>

          {loading && (
            <p className="mt-4 text-center text-xs font-medium uppercase tracking-[0.14em] text-on-surface-variant">
              Syncing profile and publication metrics...
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
