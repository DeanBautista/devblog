export default function MetricCard({ label, value, caption }) {
  return (
    <article className="rounded-xl border border-outline-variant/30 bg-surface-container-low/60 px-4 py-4 sm:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/80">{label}</p>
      <p className="mt-3 text-3xl font-semibold leading-none text-on-surface sm:text-[2rem]">{value}</p>
      <p className="mt-2 text-xs text-on-surface-variant">{caption}</p>
    </article>
  );
}
