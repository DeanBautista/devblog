import { Eye, Edit, Trash2 } from "lucide-react";

const STATUS_STYLES = {
  PUBLISHED: "border border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  DRAFT: "border border-amber-300/25 bg-amber-400/10 text-amber-200",
};

const COVER_STYLES = {
  mint: "from-[#c8f8e6] via-[#98dfcc] to-[#63b7a1]",
  graphite: "from-[#8a90a4] via-[#6f7487] to-[#505668]",
  parchment: "from-[#f7ead0] via-[#e6d6bb] to-[#c8b390]",
  ivory: "from-[#f4efe2] via-[#e5d6b8] to-[#c9b186]",
};

function PostCover({ variant, title }) {
  const gradient = COVER_STYLES[variant] ?? COVER_STYLES.mint;

  return (
    <div className={`relative h-12 w-14 overflow-hidden rounded-lg bg-linear-to-r ${gradient}`}>
      <span className="absolute left-1.5 top-1.5 bottom-1.5 w-0.75 rounded-full bg-white/70" />
      <span className="absolute left-3.5 top-1.5 bottom-1.5 w-0.5 rounded-full bg-white/45" />
      <span className="absolute right-2 top-1.5 bottom-1.5 w-0.5 rounded-full bg-black/10" />
      <span className="sr-only">{title} cover</span>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <article
      className="animate-pulse rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-4 sm:px-5"
      aria-hidden="true"
    >
      <div className="xl:hidden">
        <div className="flex items-start gap-3">
          <span className="h-12 w-14 rounded-lg bg-surface-container" />

          <div className="min-w-0 flex-1">
            <span className="block h-4 w-11/12 rounded-md bg-surface-container" />
            <span className="mt-2 block h-3 w-24 rounded-md bg-surface-container" />
          </div>

          <div className="flex gap-2">
            <span className="h-9 w-9 rounded-md border border-outline-variant/30 bg-surface-container" />
            <span className="h-9 w-9 rounded-md border border-outline-variant/30 bg-surface-container" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="h-6 w-16 rounded-full bg-surface-container" />
          <span className="h-6 w-20 rounded-md bg-surface-container" />
          <span className="h-6 w-24 rounded-md bg-surface-container" />
        </div>
      </div>

      <div className="hidden items-center gap-4 xl:grid xl:grid-cols-[84px_minmax(0,1.7fr)_112px_112px_108px_70px]">
        <span className="h-12 w-14 rounded-lg bg-surface-container" />

        <div className="min-w-0">
          <span className="block h-5 w-4/5 rounded-md bg-surface-container" />
          <span className="mt-2 block h-3 w-24 rounded-md bg-surface-container" />
        </div>

        <span className="h-6 w-16 rounded-full bg-surface-container" />
        <span className="h-4 w-16 rounded-md bg-surface-container" />
        <span className="h-8 w-14 rounded-md bg-surface-container" />

        <div className="flex gap-2">
          <span className="h-9 w-9 rounded-md border border-outline-variant/30 bg-surface-container" />
          <span className="h-9 w-9 rounded-md border border-outline-variant/30 bg-surface-container" />
        </div>
      </div>
    </article>
  );
}

export default function PostCard({ post }) {
  const statusClass =
    STATUS_STYLES[post.status] ??
    "border border-outline-variant/30 bg-surface-container text-on-surface";

  return (
    <article className="rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-4 sm:px-5">
      <div className="xl:hidden">
        <div className="flex items-start gap-3">
          <PostCover variant={post.coverVariant} title={post.title} />

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-snug text-on-surface">{post.title}</h3>
            <p className="mt-1 text-xs text-on-surface-variant">
              {post.readTime}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-outline-variant/30 p-2 text-on-surface-variant transition-colors hover:bg-surface-container"
              aria-label={`Edit ${post.title}`}
            >
              <Edit size={16} />
            </button>
            <button
              type="button"
              className="rounded-md border border-outline-variant/30 p-2 text-on-surface-variant transition-colors hover:bg-surface-container"
              aria-label={`Delete ${post.title}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] ${statusClass}`}>
            {post.status}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-container px-2 py-1">
            <Eye size={13} />
            <span>{post.views.toLocaleString()}</span>
          </span>

          <span className="rounded-md bg-surface-container px-2 py-1">{post.dateMobile}</span>
        </div>
      </div>

      <div className="hidden items-center gap-4 xl:grid xl:grid-cols-[84px_minmax(0,1.7fr)_112px_112px_108px_70px]">
        <PostCover variant={post.coverVariant} title={post.title} />

        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug text-on-surface">{post.title}</h3>
          <p className="mt-1 text-xs text-on-surface-variant">
            {post.readTime}
          </p>
        </div>

        <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] ${statusClass}`}>
          {post.status}
        </span>

        <span className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
          <Eye size={14} />
          <span>{post.views.toLocaleString()}</span>
        </span>

        <span className="whitespace-pre-line text-xs leading-5 text-on-surface-variant">{post.dateDesktop}</span>

        <div className="flex gap-2">
          <button
            type="button"
            className="w-fit rounded-md border border-outline-variant/30 p-2 text-on-surface-variant transition-colors hover:bg-surface-container"
            aria-label={`Edit ${post.title}`}
          >
            <Edit size={16} />
          </button>
          <button
            type="button"
            className="w-fit rounded-md border border-outline-variant/30 p-2 text-on-surface-variant transition-colors hover:bg-surface-container"
            aria-label={`Delete ${post.title}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}