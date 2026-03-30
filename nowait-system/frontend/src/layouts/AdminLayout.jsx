import { Outlet } from "react-router-dom";
import SidebarNav from "../components/SidebarNav";
import { useAuth } from "../context/AuthContext";
import { useQueue } from "../context/QueueContext";

const navItems = [
  {
    to: "/admin-dashboard",
    label: "Operations",
    description: "Advance, skip, and monitor the queue in real time.",
  },
  {
    to: "/display",
    label: "Display board",
    description: "Open the large public token display screen.",
  },
  {
    to: "/login",
    label: "Sign in",
    description: "Return to the authentication screen.",
  },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const { socketConnected } = useQueue();

  return (
    <div className="page-shell px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[280px_1fr]">
        <SidebarNav
          items={navItems}
          footer={
            <div className="rounded-3xl border border-white/10 bg-slate-950/[0.6] p-4">
              <div className="text-sm text-slate-300">
                Signed in as <span className="font-semibold text-white">{user?.displayName}</span>
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                {user?.role}
              </div>
              <div className="mt-3 text-xs uppercase tracking-[0.24em] text-cyan-200/80">
                {socketConnected ? "Live system online" : "Socket reconnecting"}
              </div>
              <button
                type="button"
                className="secondary-button mt-4 w-full"
                onClick={logout}
              >
                Sign out
              </button>
            </div>
          }
        />

        <main className="space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
