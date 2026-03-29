import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Book & Track" },
  { to: "/display", label: "Display Board" },
  { to: "/admin/login", label: "Admin" },
];

export default function UserLayout() {
  return (
    <div className="page-shell px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="glass-card mb-6 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="section-label">Smart Queue & Booking System</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                NoWait
              </div>
            </div>

            <nav className="flex flex-wrap gap-3">
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
            </nav>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
