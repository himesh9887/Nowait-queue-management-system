import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQueue } from "../context/QueueContext";

const links = [
  { to: "/user-dashboard", label: "My Dashboard" },
  { to: "/display", label: "Queue Display" },
];

export default function UserLayout() {
  const { logout, user } = useAuth();
  const { socketConnected } = useQueue();

  return (
    <div className="page-shell px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="glass-card user-layout-header mb-6 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="section-label">User Dashboard</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Welcome, {user?.displayName || user?.username}
              </div>
              <div className="mt-2 text-sm text-slate-300">
                Track your token, live ETA, and queue movement from one place.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="user-dashboard-chip">
                <span className={`h-2 w-2 rounded-full ${socketConnected ? "bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.85)]" : "bg-slate-500"}`} />
                <span>{socketConnected ? "Queue connected" : "Queue reconnecting"}</span>
              </div>

              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "border-cyan-400/40 bg-cyan-400/[0.12] text-cyan-100"
                        : "border-white/10 bg-white/[0.05] text-slate-200 hover:border-white/20 hover:bg-white/[0.08]"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <button
                type="button"
                className="secondary-button"
                onClick={logout}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
