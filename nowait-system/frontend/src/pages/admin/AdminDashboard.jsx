import { useDeferredValue, useState } from "react";
import GlassPanel from "../../components/GlassPanel";
import LiveBoard from "../../components/LiveBoard";
import LoadingScreen from "../../components/LoadingScreen";
import QueueTable from "../../components/QueueTable";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import {
  formatDateTime,
  formatMinutes,
  formatShortDate,
  formatToken,
} from "../../utils/formatters";
import { useQueue } from "../../context/QueueContext";

export default function AdminDashboard() {
  const {
    bookings,
    bookingsLoading,
    busyAction,
    currentServing,
    daySummaries,
    loading,
    nextToken,
    nextUp,
    queue,
    refreshBookings,
    refreshQueue,
    resetQueue,
    selectedDay,
    selectedDayInfo,
    setSelectedDay,
    skipToken,
    socketConnected,
    stats,
  } = useQueue();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const deferredSearch = useDeferredValue(search);
  const canServeSelectedDay = selectedDayInfo?.canServe;

  if (loading) {
    return <LoadingScreen label="Loading admin operations..." />;
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === "all" ? true : booking.status === filter;
    const matchesSearch = deferredSearch
      ? `${booking.tokenNumber} ${booking.bookedBy || ""} ${
          booking.bookingLabel || ""
        } ${booking.bookingDisplayDate || ""}`
          .toLowerCase()
          .includes(deferredSearch.toLowerCase())
      : true;

    return matchesFilter && matchesSearch;
  });

  async function handleResetQueue() {
    const shouldReset = window.confirm(
      `Reset the ${selectedDayInfo?.label?.toLowerCase() || "selected"} queue and remove all tokens?`,
    );

    if (shouldReset) {
      await resetQueue();
    }
  }

  return (
    <div className="space-y-6">
      <GlassPanel
        eyebrow="Operations Center"
        title="Run the queue with live visibility"
        description="Advance callers, protect tomorrow from early serving, and monitor every booking from a single responsive dashboard."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={`${selectedDayInfo?.label || "Selected"} tokens`}
            value={stats.totalTokens}
            description="All bookings in the active queue day"
          />
          <StatCard
            label="Active queue"
            value={stats.activeQueue}
            description="Waiting or currently serving"
          />
          <StatCard
            label="Completed"
            value={stats.completedTokens}
            description="Finished and skipped tokens"
          />
          <StatCard
            label="System status"
            value={socketConnected ? "Live" : "Syncing"}
            description="Real-time socket connection"
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {daySummaries.map((day) => {
            const active = day.relativeLabel === selectedDay;

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDay(day.relativeLabel)}
                className={`rounded-[1.5rem] border p-4 text-left transition ${
                  active
                    ? "border-cyan-400/35 bg-cyan-400/[0.12] shadow-[0_18px_40px_rgba(34,211,238,0.12)]"
                    : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-white">{day.label}</div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    {day.displayDate}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-slate-300">
                  <div>
                    <div className="user-dashboard-label">Waiting</div>
                    <div className="mt-1 text-xl font-semibold text-white">
                      {day.waitingTokens}
                    </div>
                  </div>
                  <div>
                    <div className="user-dashboard-label">Serving</div>
                    <div className="mt-1 text-xl font-semibold text-white">
                      {formatToken(day.currentServingToken)}
                    </div>
                  </div>
                  <div>
                    <div className="user-dashboard-label">Forecast</div>
                    <div className="mt-1 text-xl font-semibold text-white">
                      {formatMinutes(day.queueForecast)}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </GlassPanel>

      {!canServeSelectedDay ? (
        <GlassPanel
          eyebrow="Future Queue"
          title="Tomorrow is visible but locked"
          description="Tomorrow bookings are intentionally isolated. Admins can review the queue now, but service actions stay disabled until tomorrow begins."
        />
      ) : null}

      <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel
          eyebrow="Controls"
          title={`${selectedDayInfo?.label || "Selected"} queue actions`}
          description="Use these controls to keep the service line moving safely."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              className="primary-button h-12"
              disabled={busyAction === "next" || !canServeSelectedDay}
              onClick={nextToken}
            >
              {busyAction === "next" ? "Calling next..." : "Next token"}
            </button>
            <button
              type="button"
              className="secondary-button h-12"
              disabled={busyAction === "skip" || !canServeSelectedDay}
              onClick={skipToken}
            >
              {busyAction === "skip" ? "Skipping token..." : "Skip token"}
            </button>
            <button
              type="button"
              className="secondary-button h-12"
              onClick={() => {
                void refreshQueue({ silent: false });
                void refreshBookings(selectedDay);
              }}
            >
              Refresh dashboard
            </button>
            <button
              type="button"
              className="danger-button h-12"
              disabled={busyAction === "reset"}
              onClick={handleResetQueue}
            >
              {busyAction === "reset" ? "Resetting queue..." : "Reset queue"}
            </button>
          </div>
        </GlassPanel>

        <LiveBoard
          currentServing={currentServing}
          nextUp={nextUp}
          stats={stats}
          selectedDayInfo={selectedDayInfo}
        />
      </div>

      <QueueTable
        title={`${selectedDayInfo?.label || "Selected"} active queue`}
        description="Serving and waiting tokens update automatically as bookings are created or the queue advances."
        tokens={queue}
        emptyMessage={`No active tokens in the ${selectedDayInfo?.label?.toLowerCase() || "selected"} queue right now.`}
        showBookedBy
      />

      <GlassPanel
        eyebrow="Manage Bookings"
        title="Full token ledger"
        description="Search and filter every token in the selected day while keeping the currently serving entry easy to spot."
        className="p-0"
      >
        <div className="grid gap-4 border-b border-white/10 px-6 py-6 sm:grid-cols-[1fr_auto] sm:px-8">
          <input
            className="soft-input"
            placeholder="Search by token, user, or booking day"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="flex gap-2">
            {["all", "waiting", "serving", "completed"].map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? "primary-button" : "secondary-button"}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {bookingsLoading ? (
          <div className="px-6 py-10 text-sm text-slate-400 sm:px-8">
            Loading bookings...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.24em] text-slate-400">
                <tr>
                  <th className="px-6 py-4 sm:px-8">Token</th>
                  <th className="px-6 py-4 sm:px-8">Booked By</th>
                  <th className="px-6 py-4 sm:px-8">Booking Day</th>
                  <th className="px-6 py-4 sm:px-8">Status</th>
                  <th className="px-6 py-4 sm:px-8">Position</th>
                  <th className="px-6 py-4 sm:px-8">ETA</th>
                  <th className="px-6 py-4 sm:px-8">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className={`border-b border-white/[0.06] text-sm text-slate-200 last:border-b-0 ${
                      booking.isCurrent ? "bg-emerald-400/[0.08]" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-white sm:px-8">
                      {formatToken(booking.tokenNumber)}
                    </td>
                    <td className="px-6 py-4 sm:px-8">{booking.bookedBy}</td>
                    <td className="px-6 py-4 sm:px-8">
                      <div className="font-medium text-white">
                        {booking.bookingLabel || "Booked"}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {formatShortDate(booking.bookingDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 sm:px-8">
                      <StatusBadge status={booking.status} skipped={booking.wasSkipped} />
                    </td>
                    <td className="px-6 py-4 sm:px-8">
                      {booking.queuePosition || booking.position || "-"}
                    </td>
                    <td className="px-6 py-4 sm:px-8">
                      {formatMinutes(booking.estimatedWaitingTime)}
                    </td>
                    <td className="px-6 py-4 text-slate-400 sm:px-8">
                      {formatDateTime(booking.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
