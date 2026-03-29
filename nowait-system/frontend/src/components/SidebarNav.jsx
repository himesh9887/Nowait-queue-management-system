import { NavLink } from "react-router-dom";

export default function SidebarNav({ items, footer }) {
  return (
    <aside className="glass-card sticky top-6 h-fit p-4">
      <div className="rounded-3xl border border-white/10 bg-slate-950/[0.6] p-4">
        <div className="section-label">Admin Console</div>
        <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
          NoWait Ops
        </div>
      </div>

      <nav className="mt-4 grid gap-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "border-cyan-400/40 bg-cyan-400/[0.12] text-cyan-100"
                  : "border-white/[0.08] bg-white/[0.04] text-slate-200 hover:border-white/[0.15] hover:bg-white/[0.08]"
              }`
            }
          >
            <div>{item.label}</div>
            <div className="mt-1 text-xs text-slate-400">{item.description}</div>
          </NavLink>
        ))}
      </nav>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </aside>
  );
}
