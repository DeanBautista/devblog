import { useEffect, useState } from 'react';
import ColdStartNoticeToast from '../../components/public/ColdStartNoticeToast';
import { getPublicWarmup } from '../../lib/public';

const TOPICS = [
  {
    id: 'rendering',
    title: 'Rendering & Performance',
    description:
      "Why things re-render, when it actually matters, and when you're overthinking it. Posts here break down real-world scenarios — diffing behavior, memoization trade-offs, and how to spot the renders that genuinely hurt your app.",
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    alt: 'Code on a monitor with performance metrics',
  },
  {
    id: 'language',
    title: 'Language Deep-Dives',
    description:
      "The quirks of JavaScript and TypeScript that trip you up until they suddenly click. Closures, coercion, type narrowing, async pitfalls — written the way I wish someone had explained them to me when I was staring at a confusing stack trace.",
    image: 'https://images.unsplash.com/photo-1542903660-eedba2cda584?w=800&q=80',
    alt: 'Close-up of JavaScript code on screen',
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Patterns',
    description:
      "Frontend, backend, and the messy handshake between them. API design decisions, data-fetching strategies, auth flows, and the architecture choices that seem small until they aren't — written from the perspective of someone actively building and learning.",
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    alt: 'Server racks and network infrastructure',
  },
];

export default function About() {
  const [isWarmupLoading, setIsWarmupLoading] = useState(true);

  useEffect(() => {
    let shouldIgnore = false;

    async function warmupPublicRoute() {
      try {
        await getPublicWarmup();
      } catch {
        // Keep About content visible even if warm-up request fails.
      } finally {
        if (!shouldIgnore) {
          setIsWarmupLoading(false);
        }
      }
    }

    warmupPublicRoute();

    return () => {
      shouldIgnore = true;
    };
  }, []);

  return (
    <>
      <ColdStartNoticeToast visible={isWarmupLoading} delayMs={5000} />

      <section className="mx-auto w-full max-w-4xl px-5 pb-20 pt-12 md:px-8 md:pt-16">
        {/* Label */}
        <p className="about-reveal text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
          About
        </p>

        {/* Hero heading */}
        <h1 className="about-reveal about-reveal-delay-1 mt-3 text-5xl font-semibold tracking-tight text-on-surface">
          Writing what the docs forgot to say
        </h1>

        {/* ── Why this blog exists — large image on top ── */}
        <div className="about-reveal about-reveal-delay-2 mt-8 overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-low/60">
          {/* Hero image */}
          <div className="h-64 w-full md:h-80">
            <img
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80"
              alt="Developer writing code at a desk"
              className="h-full w-full object-cover"
              decoding="async"
              fetchPriority="high"
            />
          </div>

          {/* Text below image */}
          <div className="p-6 md:p-8">
            <h3 className="text-lg font-semibold text-on-surface">Why this blog exists</h3>
            <p className="mt-3 text-base leading-relaxed text-on-surface-variant">
              Every bug I've hunted, every refactor I've second-guessed, and every "why does this
              even work?" moment eventually ends up here. This blog is how I think out loud —
              turning messy problem-solving sessions into clean, useful write-ups that I can
              reference later (and hopefully save you a few hours too).
            </p>
            <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
              The posts lean practical: real code, real trade-offs, and honest takes on patterns
              that are worth using — or worth avoiding. No hype, no filler.
            </p>
          </div>
        </div>

        {/* ── What you'll find here — alternating image / text ── */}
        <div className="about-reveal about-reveal-delay-3 mt-10">
          <h3 className="text-lg font-semibold text-on-surface">What you'll find here</h3>

          <div className="mt-6 flex flex-col gap-5">
            {TOPICS.map((topic, index) => {
              const imageRight = index % 2 !== 0;

              return (
                <div
                  key={topic.id}
                  className={`about-reveal flex flex-col overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-low/60 md:flex-row ${
                    imageRight ? 'md:flex-row-reverse' : ''
                  }`}
                  style={{
                    '--about-delay': `${320 + index * 90}ms`,
                  }}
                >
                  {/* Image */}
                  <div className="h-56 w-full shrink-0 md:h-auto md:w-2/5">
                    <img
                      src={topic.image}
                      alt={topic.alt}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {/* Text */}
                  <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
                    <h4 className="text-xl font-semibold text-on-surface">{topic.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                      {topic.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>
    </>
  );
}