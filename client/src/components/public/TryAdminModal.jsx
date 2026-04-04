import { useEffect } from 'react';

const TRY_ADMIN_MODAL_IMAGE_URL =
  'https://img.freepik.com/premium-vector/man-working-computer-vector-illustration-flat-style_258706-39.jpg?semt=ais_hybrid&w=740&q=80';

export default function TryAdminModal({ isOpen, onTryNow, onDismiss }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onDismiss();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onDismiss]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="try-admin-modal-backdrop fixed inset-0 z-70 flex items-center justify-center px-4 py-8"
      role="presentation"
      onClick={onDismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="try-admin-modal-title"
        className="try-admin-modal-shell relative w-full max-w-lg overflow-hidden rounded-[30px] border border-primary/35 bg-surface-container p-6 shadow-[0_26px_70px_-36px_rgba(11,19,38,0.95)] sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="try-admin-modal-aura pointer-events-none absolute -inset-px rounded-[30px]" aria-hidden="true" />
        <div className="try-admin-modal-grid pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative z-10 flex flex-col gap-5">
          <div className="overflow-hidden rounded-2xl border border-primary/30 bg-surface-container-high">
            <img
              src={TRY_ADMIN_MODAL_IMAGE_URL}
              alt="Illustration of a person working on a computer"
              className="h-48 w-full object-cover object-center"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/85">CMS Playground</p>
            <h2 id="try-admin-modal-title" className="text-xl font-extrabold leading-snug text-on-surface sm:text-2xl">
              Try creating your own blog post by using the admin feature!
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Jump into the editor, experiment with content blocks, and publish a post flow in seconds.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onTryNow}
              className="try-admin-primary-button relative inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-extrabold uppercase tracking-[0.16em]"
            >
              Try now!
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex w-full items-center justify-center rounded-xl border border-outline-variant/60 bg-surface-container-low px-5 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-on-surface-variant transition-colors duration-200 hover:border-primary/45 hover:text-on-surface"
            >
              No, thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
