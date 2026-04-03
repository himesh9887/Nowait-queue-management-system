import { useDeferredValue, useEffect, useState } from "react";
import Analytics from "../../components/admin/Analytics";
import ControlPanel from "../../components/admin/ControlPanel";
import {
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  MenuIcon,
  PulseIcon,
  QueueIcon,
  SparkIcon,
  TicketIcon,
} from "../../components/admin/AdminIcons";
import QueueTable from "../../components/admin/QueueTable";
import Sidebar from "../../components/admin/Sidebar";
import StatsCards from "../../components/admin/StatsCards";
import LoadingScreen from "../../components/LoadingScreen";
import { useAuth } from "../../context/AuthContext";
import { useQueue } from "../../context/QueueContext";
import {
  formatDateTime,
  formatLongDate,
  formatShortDate,
  formatToken,
} from "../../utils/formatters";

const bookingFilters = [
  { key: "all", label: "All bookings" },
  { key: "waiting", label: "Waiting" },
  { key: "serving", label: "Serving" },
  { key: "completed", label: "Completed" },
  { key: "skipped", label: "Skipped" },
];

function getStatusTone(booking) {
  if (booking.wasSkipped) {
    return "bg-amber-400/12 text-amber-100";
  }

  if (booking.status === "completed") {
    return "bg-emerald-400/12 text-emerald-100";
  }

  if (booking.status === "serving") {
    return "bg-violet-400/12 text-violet-100";
  }

  return "bg-cyan-400/12 text-cyan-100";
}

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const {
    bookings,
    bookingsLoading,
    busyAction,
    currentServing,
    daySummaries,
    generatedAt,
    loading,
    nextToken,
    nextUp,
    queue,
    refreshing,
    refreshBookings,
    refreshQueue,
    resetQueue,
    selectedDay,
    selectedDayInfo,
    setSelectedDay,
    skipToken,
    socketConnected,
    startServing,
    stats,
  } = useQueue();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const canServeSelectedDay = selectedDayInfo?.canServe;
  const waitingTokens = queue.filter((token) => token.status === "waiting");
  const nextTokens = waitingTokens.slice(0, 5);
  const averageObservedWait = bookings
    .map((booking) => {
      if (!booking.createdAt || (!booking.calledAt && !booking.completedAt)) {
        return null;
      }

      const start = new Date(booking.createdAt).getTime();
      const served = new Date(booking.calledAt || booking.completedAt).getTime();
      const diff = Math.round((served - start) / 60000);

      return Number.isFinite(diff) && diff >= 0 ? diff : null;
    })
    .filter((value) => value !== null);
  const averageWaitMinutes = averageObservedWait.length
    ? Math.round(
        averageObservedWait.reduce((total, value) => total + value, 0) /
          averageObservedWait.length,
      )
    : stats.avgServiceTime;

  const notificationItems = [
    socketConnected
      ? {
          title: "Realtime queue sync is active",
          detail: "Socket updates are flowing normally.",
          toneClassName: "border-emerald-300/18 bg-emerald-400/8 text-emerald-50",
        }
      : {
          title: "Realtime sync is reconnecting",
          detail: "The dashboard will refresh automatically once the socket recovers.",
          toneClassName: "border-amber-300/18 bg-amber-400/8 text-amber-50",
        },
    !canServeSelectedDay
      ? {
          title: `${selectedDayInfo?.label || "Selected day"} is locked`,
          detail: "You can review tomorrow bookings, but service actions stay disabled until the day begins.",
          toneClassName: "border-cyan-300/18 bg-cyan-400/[0.08] text-cyan-50",
        }
      : null,
    currentServing
      ? {
          title: `Serving token ${formatToken(currentServing.tokenNumber)}`,
          detail: `${currentServing.bookedBy || "Current customer"} is active right now.`,
          toneClassName: "border-violet-300/18 bg-violet-400/[0.08] text-violet-50",
        }
      : nextUp
        ? {
            title: "Queue is waiting to start",
            detail: `Use Start Serving to begin with token ${formatToken(nextUp.tokenNumber)}.`,
            toneClassName: "border-cyan-300/18 bg-cyan-400/[0.08] text-cyan-50",
          }
      : {
          title: "Queue is ready for the next call",
          detail: "No token is currently marked as serving and no waiting entries are available.",
          toneClassName: "border-white/10 bg-white/4 text-slate-100",
        },
  ].filter(Boolean);
  const statsCards = [
    {
      label: "Total Tokens Today",
      value: stats.todayTokens,
      meta: "all bookings scheduled today",
      badge: `${stats.tomorrowTokens} tomorrow`,
      icon: TicketIcon,
      iconClassName: "border-cyan-300/20 bg-cyan-400/[0.12] text-cyan-100",
      accentClassName: "text-cyan-200",
    },
    {
      label: "Active Queue",
      value: stats.activeQueue,
      meta: "serving and waiting entries",
      badge: `${stats.waitingTokens} waiting`,
      icon: QueueIcon,
      iconClassName: "border-violet-300/20 bg-violet-400/[0.12] text-violet-100",
      accentClassName: "text-violet-200",
    },
    {
      label: "Completed Tokens",
      value: stats.completedTokens,
      meta: "finished or skipped today",
      badge: "service outcomes",
      icon: CheckCircleIcon,
      iconClassName: "border-emerald-300/20 bg-emerald-400/[0.12] text-emerald-100",
      accentClassName: "text-emerald-200",
    },
    {
      label: "Average Waiting Time",
      value: averageWaitMinutes ? `${averageWaitMinutes}m` : "Up next",
      meta: "based on served bookings",
      badge: "real queue pace",
      icon: ClockIcon,
      iconClassName: "border-amber-300/20 bg-amber-400/[0.12] text-amber-100",
      accentClassName: "text-amber-200",
    },
  ];
  const heroSpotlights = [
    {
      label: "Current serving",
      value: formatToken(currentServing?.tokenNumber),
      detail: currentServing?.bookedBy || "No customer is currently being served.",
      toneClassName: "border-emerald-300/18 bg-emerald-400/10",
    },
    {
      label: "Next up",
      value: formatToken(nextUp?.tokenNumber),
      detail: nextUp
        ? `${nextUp.bookedBy || "Walk-in"} is next in line.`
        : "No waiting token is queued next right now.",
      toneClassName: "border-cyan-300/18 bg-cyan-400/10",
    },
    {
      label: "Selected day",
      value: selectedDayInfo?.label || "Today",
      detail: canServeSelectedDay
        ? "Service actions are enabled for this queue."
        : "Planning mode only until this queue day starts.",
      toneClassName: "border-violet-300/18 bg-violet-400/10",
    },
  ];
  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "skipped"
          ? booking.wasSkipped
          : filter === "completed"
            ? booking.status === "completed" && !booking.wasSkipped
            : booking.status === filter;
    const matchesSearch = deferredSearch
      ? `${booking.tokenNumber} ${booking.bookedBy || ""} ${
          booking.bookingLabel || ""
        } ${booking.bookingDisplayDate || ""}`
          .toLowerCase()
          .includes(deferredSearch.toLowerCase())
      : true;

    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    const sectionIds = [
      "dashboard",
      "queue-management",
      "booking-management",
      "analytics",
    ];
    const sections = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter(Boolean);

    if (!sections.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -52% 0px",
        threshold: [0.15, 0.4, 0.65],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  function handleNavigate(sectionId) {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleRefresh() {
    await refreshQueue({ silent: false });
    await refreshBookings(selectedDay);
  }

  async function handleResetQueue() {
    setShowResetDialog(false);
    await resetQueue();
  }

  if (loading) {
    return <LoadingScreen label="Loading admin dashboard..." />;
  }

  return (
    <>
      <div className="mx-auto max-w-430">
        <div className="grid gap-5 xl:grid-cols-[310px_minmax(0,1fr)] xl:gap-6">
          <Sidebar
            activeSection={activeSection}
            daySummaries={daySummaries}
            mobileOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
            onLogout={logout}
            onNavigate={handleNavigate}
            socketConnected={socketConnected}
            user={user}
          />

          <main className="min-w-0 space-y-5 sm:space-y-6">
            <header className="admin-panel admin-fade-up overflow-visible">
              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
                <div>
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => setMobileSidebarOpen(true)}
                      className="admin-chip h-11 w-11 justify-center p-0 xl:hidden"
                      aria-label="Open navigation"
                    >
                      <MenuIcon />
                    </button>

                    <div>
                      <div className="admin-kicker">Admin Dashboard</div>
                      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                        Welcome back, {user?.displayName || "Admin"}
                      </h1>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                        Monitor live tokens, control the queue with confidence, and
                        keep booking operations aligned across today and tomorrow.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <div className="admin-chip w-full justify-center sm:w-auto">
                      <CalendarIcon className="h-4 w-4 text-cyan-200" />
                      {formatLongDate(new Date())}
                    </div>

                    <div className="admin-chip w-full justify-center sm:w-auto">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          refreshing
                            ? "bg-amber-300"
                            : socketConnected
                              ? "bg-emerald-300"
                              : "bg-slate-400"
                        }`}
                      />
                      {refreshing ? "Refreshing" : socketConnected ? "Live" : "Offline"}
                    </div>

                    <div className="admin-chip w-full justify-center sm:w-auto">
                      <QueueIcon className="h-4 w-4 text-violet-200" />
                      {selectedDayInfo?.label || "Today"} queue
                    </div>

                    <div className="relative w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setShowNotifications((current) => !current)}
                        className="admin-chip relative w-full justify-between sm:w-auto sm:justify-center"
                      >
                        <BellIcon className="h-4 w-4 text-cyan-200" />
                        Alerts
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-cyan-300 px-2 text-xs font-semibold text-slate-950">
                          {notificationItems.length}
                        </span>
                      </button>

                      {showNotifications ? (
                        <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-30 w-full rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,17,31,0.96),rgba(8,11,21,0.98))] p-4 shadow-[0_28px_80px_rgba(2,6,23,0.5)] backdrop-blur-3xl sm:left-auto sm:right-0 sm:w-[min(24rem,80vw)]">
                          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            Notifications
                          </div>
                          <div className="mt-4 space-y-3">
                            {notificationItems.map((item) => (
                              <div
                                key={item.title}
                                className={`rounded-[1.35rem] border px-4 py-3 ${item.toneClassName}`}
                              >
                                <div className="text-sm font-semibold">{item.title}</div>
                                <div className="mt-2 text-sm leading-6 opacity-80">
                                  {item.detail}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="admin-surface">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Queue pressure
                      </div>
                      <div className="mt-3 text-2xl font-semibold text-white">
                        {stats.waitingTokens} waiting
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {stats.activeQueue} active entries are still moving through the line.
                      </p>
                    </div>

                    <div className="admin-surface">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Last sync
                      </div>
                      <div className="mt-3 text-2xl font-semibold text-white">
                        {generatedAt ? formatDateTime(generatedAt) : "--"}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Queue, bookings, and alert panels are aligned to the latest refresh.
                      </p>
                    </div>

                    <div className="admin-surface">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Queue pace
                      </div>
                      <div className="mt-3 text-2xl font-semibold text-white">
                        {stats.avgServiceTime ? `${stats.avgServiceTime}m avg` : "Up next"}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Keep the service rhythm visible before advancing the next token.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
                  {heroSpotlights.map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-[1.75rem] border p-4 shadow-[0_18px_42px_rgba(15,23,42,0.18)] ${item.toneClassName}`}
                    >
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-300/80">
                        {item.label}
                      </div>
                      <div className="mt-3 break-words text-3xl font-semibold tracking-tight text-white">
                        {item.value}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-200/80">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </header>
            <section
              id="dashboard"
              className="admin-panel admin-dashboard-hero admin-fade-up"
            >
              <div className="admin-dashboard-glow" />
              <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-end 2xl:justify-between">
                <div className="relative z-10">
                  <div className="admin-kicker">Operations Overview</div>
                  <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Premium visibility across queue flow, booking health, and live
                    service activity.
                  </h2>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="admin-chip">
                      <PulseIcon className="h-4 w-4 text-cyan-200" />
                      Accurate day-separated queues
                    </div>
                    <div className="admin-chip">
                      <SparkIcon className="h-4 w-4 text-violet-200" />
                      No token creation from admin
                    </div>
                    <div className="admin-chip">
                      <ClockIcon className="h-4 w-4 text-amber-200" />
                      Last sync {generatedAt ? formatDateTime(generatedAt) : "--"}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid gap-3 sm:grid-cols-2">
                  {daySummaries.map((day) => {
                    const isActive = day.relativeLabel === selectedDay;

                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => setSelectedDay(day.relativeLabel)}
                        className={`rounded-[1.7rem] border p-4 text-left transition duration-300 ${
                          isActive
                            ? "border-cyan-300/24 bg-cyan-400/12 shadow-[0_18px_48px_rgba(34,211,238,0.16)]"
                            : "border-white/10 bg-white/4 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/6"
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-lg font-semibold text-white">{day.label}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                              {day.displayDate}
                            </div>
                          </div>
                          <div
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                              day.canServe
                                ? "bg-emerald-400/12 text-emerald-100"
                                : "bg-amber-400/12 text-amber-100"
                            }`}
                          >
                            {day.canServe ? "Live day" : "Locked"}
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          <div className="rounded-[1.2rem] border border-white/8 bg-slate-950/48 p-3">
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Waiting
                            </div>
                            <div className="mt-2 text-xl font-semibold text-white">
                              {day.waitingTokens}
                            </div>
                          </div>
                          <div className="rounded-[1.2rem] border border-white/8 bg-slate-950/48 p-3">
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Serving
                            </div>
                            <div className="mt-2 text-xl font-semibold text-white">
                              {formatToken(day.currentServingToken)}
                            </div>
                          </div>
                          <div className="col-span-2 rounded-[1.2rem] border border-white/8 bg-slate-950/48 p-3 sm:col-span-1">
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Completed
                            </div>
                            <div className="mt-2 text-xl font-semibold text-white">
                              {day.completedTokens}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative z-10 mt-6">
                <StatsCards cards={statsCards} />
              </div>
            </section>
            <section
              id="queue-management"
              className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]"
            >
              <div className="admin-panel admin-fade-up">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <div className="admin-kicker">Live Queue</div>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                      Serving status for {selectedDayInfo?.label?.toLowerCase() || "today"}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                      The current serving token and the upcoming queue update
                      automatically whenever a booking changes or the admin advances
                      service.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleRefresh()}
                    className="secondary-button w-full justify-center sm:w-auto"
                  >
                    {refreshing ? "Refreshing..." : "Refresh dashboard"}
                  </button>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                  <div className="relative overflow-hidden rounded-4xl border border-emerald-300/18 bg-[linear-gradient(155deg,rgba(16,185,129,0.16),rgba(8,11,21,0.92)_55%)] p-6">
                    <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
                    <div className="relative z-10">
                      <div className="text-xs uppercase tracking-[0.24em] text-emerald-100/80">
                        Current Serving Token
                      </div>
                      <div className="mt-6 break-words text-[clamp(3.25rem,18vw,5rem)] font-semibold tracking-tight text-white">
                        {formatToken(currentServing?.tokenNumber)}
                      </div>
                      <div className="mt-4 text-lg text-emerald-50/90">
                        {currentServing?.bookedBy || "Waiting for next service action"}
                      </div>
                      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-50">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
                        {currentServing ? "Live serving now" : "Queue ready"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {nextTokens.length ? (
                      nextTokens.map((token, index) => (
                        <div
                          key={token.id}
                          className="rounded-[1.6rem] border border-white/10 bg-white/4 p-4"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                                Next in queue
                              </div>
                              <div className="mt-2 text-3xl font-semibold tracking-tight text-white">
                                {formatToken(token.tokenNumber)}
                              </div>
                            </div>
                            <div className="rounded-full border border-cyan-300/18 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-50">
                              #{index + 1} next
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col gap-1 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <span>{token.bookedBy || "Walk-in"}</span>
                            <span>{token.estimatedWaitingTime} min ETA</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-full min-h-60 items-center justify-center rounded-[1.8rem] border border-dashed border-white/12 bg-white/3 px-6 py-10 text-center text-sm text-slate-400">
                        No upcoming tokens are waiting right now.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="admin-surface">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Queue health
                    </div>
                    <div className="mt-3 text-2xl font-semibold text-white">
                      {socketConnected ? "Stable" : "Recovering"}
                    </div>
                  </div>
                  <div className="admin-surface">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Waiting tokens
                    </div>
                    <div className="mt-3 text-2xl font-semibold text-white">
                      {stats.waitingTokens}
                    </div>
                  </div>
                  <div className="admin-surface">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Queue day
                    </div>
                    <div className="mt-3 text-2xl font-semibold text-white">
                      {selectedDayInfo?.label || "Today"}
                    </div>
                  </div>
                </div>
              </div>

              <ControlPanel
                busyAction={busyAction}
                canServeSelectedDay={canServeSelectedDay}
                currentServing={currentServing}
                nextUp={nextUp}
                onNext={nextToken}
                onResetRequest={() => setShowResetDialog(true)}
                onStartServing={startServing}
                onSkip={skipToken}
                queueForecast={stats.queueForecast}
                selectedDayInfo={selectedDayInfo}
                socketConnected={socketConnected}
              />
            </section>

            <QueueTable
              title={`${selectedDayInfo?.label || "Selected"} Queue`}
              description="Current serving and waiting rows are separated clearly so the admin can monitor the exact queue order at a glance."
              tokens={queue}
            />
            <section id="booking-management" className="admin-panel admin-fade-up">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <div className="admin-kicker">Booking Management</div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                    Review {selectedDayInfo?.label?.toLowerCase() || "today"} bookings
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                    Switch between today and tomorrow, filter status, and inspect the
                    full booking ledger without leaving the dashboard.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {daySummaries.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setSelectedDay(day.relativeLabel)}
                      className={
                        selectedDay === day.relativeLabel
                          ? "primary-button w-full justify-center sm:w-auto"
                          : "secondary-button w-full justify-center sm:w-auto"
                      }
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/4 p-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Search bookings
                    </span>
                    <input
                      className="soft-input"
                      placeholder="Search by token number, user, booking label, or date"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>

                  <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/52 px-4 py-3 text-sm leading-6 text-slate-300">
                    {filteredBookings.length} matching {filteredBookings.length === 1 ? "booking" : "bookings"} for{" "}
                    {selectedDayInfo?.label?.toLowerCase() || "this day"}.
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {bookingFilters.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={
                        filter === item.key
                          ? "primary-button w-full justify-center sm:w-auto"
                          : "secondary-button w-full justify-center sm:w-auto"
                      }
                      onClick={() => setFilter(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {bookingsLoading ? (
                <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/3 px-6 py-12 text-center text-sm text-slate-400">
                  Loading bookings...
                </div>
              ) : filteredBookings.length ? (
                <>
                  <div className="mt-6 grid gap-3 md:hidden">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`rounded-[1.6rem] border p-4 ${
                          booking.isCurrent
                            ? "border-emerald-300/18 bg-emerald-400/8"
                            : "border-white/10 bg-white/3"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                              Token
                            </div>
                            <div className="mt-2 text-3xl font-semibold tracking-tight text-white">
                              {formatToken(booking.tokenNumber)}
                            </div>
                          </div>

                          <div
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusTone(booking)}`}
                          >
                            {booking.wasSkipped ? "Skipped" : booking.status}
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="admin-surface">
                            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                              User
                            </div>
                            <div className="mt-2 text-sm font-medium text-white">
                              {booking.bookedBy || "Walk-in"}
                            </div>
                          </div>
                          <div className="admin-surface">
                            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                              ETA
                            </div>
                            <div className="mt-2 text-sm font-medium text-white">
                              {booking.estimatedWaitingTime || 0} min
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-[1.35rem] border border-white/8 bg-slate-950/48 p-4">
                          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            Booked
                          </div>
                          <div className="mt-2 text-sm font-medium text-white">
                            {formatDateTime(booking.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 hidden overflow-x-auto md:block">
                    <table className="min-w-full text-left">
                      <thead className="border-b border-white/10 text-xs uppercase tracking-[0.24em] text-slate-500">
                        <tr>
                          <th className="px-4 py-4 font-medium">Token Number</th>
                          <th className="px-4 py-4 font-medium">User Name</th>
                          <th className="px-4 py-4 font-medium">Status</th>
                          <th className="px-4 py-4 font-medium">Estimated Time</th>
                          <th className="px-4 py-4 font-medium">Booking Date</th>
                          <th className="px-4 py-4 font-medium">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((booking) => (
                          <tr
                            key={booking.id}
                            className={`border-b border-white/6 text-sm text-slate-200 last:border-b-0 ${
                              booking.isCurrent
                                ? "bg-emerald-400/8"
                                : "hover:bg-white/3"
                            }`}
                          >
                            <td className="px-4 py-4 font-semibold text-white">
                              {formatToken(booking.tokenNumber)}
                            </td>
                            <td className="px-4 py-4 font-medium text-white">
                              {booking.bookedBy || "Walk-in"}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusTone(booking)}`}
                              >
                                {booking.wasSkipped ? "Skipped" : booking.status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {booking.estimatedWaitingTime || 0} min
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-medium text-white">
                                {booking.bookingLabel || "Booked"}
                              </div>
                              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                                {formatShortDate(booking.bookingDate)}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-slate-400">
                              {formatDateTime(booking.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-[1.75rem] border border-dashed border-white/12 bg-white/3 px-6 py-12 text-center">
                  <div className="text-sm uppercase tracking-[0.24em] text-slate-500">
                    No bookings match
                  </div>
                  <div className="mt-3 text-lg font-medium text-slate-200">
                    Try a different queue day or status filter.
                  </div>
                </div>
              )}
            </section>

            <section id="analytics">
              <Analytics
                bookings={bookings}
                selectedDayInfo={selectedDayInfo}
                stats={stats}
              />
            </section>
          </main>
        </div>
      </div>

      {showResetDialog ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 px-4 py-4 backdrop-blur-md sm:items-center">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,17,31,0.96),rgba(8,11,21,0.98))] p-5 shadow-[0_28px_80px_rgba(2,6,23,0.55)] sm:rounded-4xl sm:p-6">
            <div className="admin-kicker">Confirm Reset</div>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Reset the {selectedDayInfo?.label?.toLowerCase() || "selected"} queue?
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              This removes all tokens for the selected day and resets that day&apos;s
              queue counter. Today and tomorrow remain separate, but the selected
              queue will be cleared immediately.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowResetDialog(false)}
                className="secondary-button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleResetQueue()}
                className="danger-button"
              >
                {busyAction === "reset" ? "Resetting..." : "Confirm reset"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
