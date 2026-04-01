const FALLBACK_COVERS = [
  'from-[#86d6c3] via-[#68bea9] to-[#4f9c89]',
  'from-[#95a3b8] via-[#728099] to-[#56627a]',
  'from-[#d8c39a] via-[#bea377] to-[#a18057]',
  'from-[#6ea9c4] via-[#588aa5] to-[#3f677d]',
];

export default function SearchResultCard({ title, imageSrc, index = 0 }) {
  const coverVariant = FALLBACK_COVERS[index % FALLBACK_COVERS.length];
  const normalizedTitle = title?.trim() || 'Untitled post';

  return (
    <article className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low/70 px-3 py-2.5">
      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-outline-variant/25 bg-surface-container-high">
        {imageSrc ? (
          <img src={imageSrc} alt={normalizedTitle} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className={`h-full w-full bg-linear-to-br ${coverVariant}`} aria-hidden="true" />
        )}
      </div>

      <p
        className="text-sm font-semibold leading-snug text-on-surface"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {normalizedTitle}
      </p>
    </article>
  );
}
