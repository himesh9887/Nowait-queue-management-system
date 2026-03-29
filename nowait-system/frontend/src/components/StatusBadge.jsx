const statusStyles = {
  waiting: "border-amber-300/25 bg-amber-400/[0.12] text-amber-100",
  serving: "border-emerald-300/25 bg-emerald-400/[0.12] text-emerald-100",
  completed: "border-slate-300/10 bg-slate-400/10 text-slate-200",
};

export default function StatusBadge({ status, skipped = false }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusStyles[status] || statusStyles.completed}`}
    >
      {skipped ? "Skipped" : status}
    </span>
  );
}
