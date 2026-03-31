import {
  CalendarIcon,
  ChartIcon,
  ChevronRightIcon,
  CloseIcon,
  DashboardIcon,
  LogoutIcon,
  QueueIcon,
  SparkIcon,
} from "./AdminIcons";

const navigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Overview and live health",
    icon: DashboardIcon,
  },
  {
    id: "queue-management",
    label: "Queue Management",
    description: "Serving flow and controls",
    icon: QueueIcon,
  },
  {
    id: "booking-management",
    label: "Booking Management",
    description: "Filter tokens by queue day",
    icon: CalendarIcon,
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Wait times and peaks",
    icon: ChartIcon,
  },
];

function SidebarSurface({
  activeSection,
  daySummaries,
  onClose,
  onLogout,
  onNavigate,
  socketConnected,
  user,
  mobile = false,
}) {
  return (
    <div className="admin-sidebar flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="admin-kicker">NoWait Admin</div>
          <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Smart Queue System
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
            Control the daily queue, monitor flow, and review bookings in one
            place.
          </p>
        </div>

        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            className="admin-chip h-11 w-11 justify-center p-0 text-slate-300 xl:hidden"
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-slate-200">Realtime sync</div>
            <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
              {socketConnected ? "Socket connected" : "Reconnecting"}
            </div>
          </div>
          <div
            className={`h-3 w-3 rounded-full ${
              socketConnected
                ? "bg-emerald-300 shadow-[0_0_24px_rgba(110,231,183,0.95)]"
                : "bg-amber-300 shadow-[0_0_20px_rgba(252,211,77,0.78)]"
            }`}
          />
        </div>
      </div>

      <nav className="mt-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`admin-nav-button ${
                isActive ? "admin-nav-button-active" : "admin-nav-button-idle"
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                  isActive
                    ? "border-cyan-300/25 bg-cyan-400/[0.16] text-cyan-100"
                    : "border-white/10 bg-white/4 text-slate-300"
                }`}
              >
                <Icon />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="mt-1 truncate text-xs text-slate-400">
                  {item.description}
                </div>
              </div>

              <ChevronRightIcon
                className={`h-4 w-4 transition ${
                  isActive ? "text-cyan-100" : "text-slate-500"
                }`}
              />
            </button>
          );
        })}
      </nav>

      <div className="mt-6 space-y-3 rounded-[1.75rem] border border-white/10 bg-slate-950/58 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <SparkIcon className="h-4 w-4 text-cyan-200" />
          Queue by day
        </div>

        {daySummaries.map((day) => (
          <div
            key={day.key}
            className="rounded-[1.35rem] border border-white/8 bg-white/3 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">{day.label}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {day.displayDate}
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-medium text-slate-300">
                {day.waitingTokens} waiting
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-4 pt-6">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/4 p-4">
          <div className="text-sm font-medium text-slate-200">
            {user?.displayName || "Admin"}
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
            {user?.role || "Administrator"}
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="danger-button w-full justify-between"
        >
          <span>Logout</span>
          <LogoutIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({
  activeSection,
  daySummaries,
  mobileOpen,
  onClose,
  onLogout,
  onNavigate,
  socketConnected,
  user,
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 xl:hidden ${
          mobileOpen ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />

        <aside
          className={`absolute inset-y-0 left-0 w-[86vw] max-w-sm p-3 transition duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarSurface
            activeSection={activeSection}
            daySummaries={daySummaries}
            onClose={onClose}
            onLogout={onLogout}
            onNavigate={(sectionId) => {
              onNavigate(sectionId);
              onClose();
            }}
            socketConnected={socketConnected}
            user={user}
            mobile
          />
        </aside>
      </div>

      <aside className="hidden xl:sticky xl:top-6 xl:block xl:h-[calc(100vh-3rem)]">
        <SidebarSurface
          activeSection={activeSection}
          daySummaries={daySummaries}
          onClose={onClose}
          onLogout={onLogout}
          onNavigate={onNavigate}
          socketConnected={socketConnected}
          user={user}
        />
      </aside>
    </>
  );
}
