import { Clock3 } from 'lucide-react';

const COLD_START_NOTICE_TEXT = 'loading may take 30-40 seconds due to server cold start';

export default function ColdStartNoticeToast({ visible = false, delayMs = 5000 }) {
  if (!visible) {
    return null;
  }

  const normalizedDelayMs = Number.isFinite(Number(delayMs)) ? Math.max(0, Number(delayMs)) : 0;

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-4 z-50 mx-auto w-auto sm:inset-x-auto sm:right-6 sm:bottom-6 sm:mx-0">
      <div
        className="cold-start-toast flex max-w-[min(32rem,calc(100vw-1.5rem))] items-start gap-3 rounded-2xl border border-outline-variant/45 bg-surface-container/95 px-3.5 py-3 text-xs text-on-surface shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-md sm:max-w-108 sm:px-4 sm:py-3.5 sm:text-sm"
        style={{ '--cold-start-delay': `${normalizedDelayMs}ms` }}
      >
        <span className="mt-0.5 rounded-full border border-primary/30 bg-primary/12 p-1.5 text-primary" aria-hidden="true">
          <Clock3 size={14} />
        </span>
        <p className="leading-relaxed text-on-surface-variant" role="status" aria-live="polite">
          {COLD_START_NOTICE_TEXT}
        </p>
      </div>
    </div>
  );
}