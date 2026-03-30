import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQueue } from "../context/QueueContext";
import { SparkWaveIcon } from "../components/user/UserIcons";

export default function UserLayout() {
  const { logout, user } = useAuth();
  const { socketConnected } = useQueue();

  return (
    <div className="page-shell px-3 py-4 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="glass-card user-layout-header mb-5 px-4 py-4 sm:mb-6 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="section-label">NoWait User Dashboard</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Welcome, {user?.displayName || user?.username}
              </div>
              <div className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                Track your queue, booking, invoice, and live desk activity from one
                premium dashboard.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="user-dashboard-chip">
                <SparkWaveIcon className="h-4 w-4 text-violet-200" />
                <span>{socketConnected ? "Live queue online" : "Realtime reconnecting"}</span>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={logout}
              >
                Logout
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
