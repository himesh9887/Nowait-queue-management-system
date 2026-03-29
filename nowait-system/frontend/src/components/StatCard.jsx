export default function StatCard({ label, value, description }) {
  return (
    <div className="metric-tile">
      <div className="text-sm uppercase tracking-[0.24em] text-slate-400">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-2 text-sm text-slate-300">{description}</div>
    </div>
  );
}
