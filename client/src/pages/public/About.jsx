import { useEffect, useState } from 'react';
import { getPublicHomeData } from '../../lib/public';

const FALLBACK_PROFILE = {
  name: 'Alex Vane',
  bio: 'I design and ship editorial systems that prioritize readability, resilience, and long-term maintainability.',
};

export default function About() {
  const [profile, setProfile] = useState(FALLBACK_PROFILE);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await getPublicHomeData();

        if (!isMounted || !response?.success || !response.profile) {
          return;
        }

        setProfile((prev) => ({
          ...prev,
          ...response.profile,
        }));
      } catch {
        // Keep fallback profile when API is unavailable.
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-4xl px-5 pb-20 pt-12 md:px-8 md:pt-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">About</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-on-surface">Building with tonal precision</h1>

      <div className="mt-8 rounded-3xl border border-outline-variant/30 bg-surface-container-low/60 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-on-surface">{profile.name}</h2>
        <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
          {profile.bio}
        </p>
        <p className="mt-6 text-sm leading-relaxed text-on-surface-variant">
          This space documents practical architecture decisions, performance strategies, and writing workflows that make product teams faster without sacrificing quality.
        </p>
      </div>
    </section>
  );
}
