import { useDeferredValue, useEffect, useState } from "react";
import toast from "react-hot-toast";
import GlassPanel from "../../components/GlassPanel";
import LiveBoard from "../../components/LiveBoard";
import LoadingScreen from "../../components/LoadingScreen";
import QueueTable from "../../components/QueueTable";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import { useQueue } from "../../context/QueueContext";
import { getBookings } from "../../services/queueService";

export default function AdminDashboard() {
  const { token } = useAuth();
  const {
    busyAction,
    currentServing,
    loading,
    nextToken,
    nextUp,
    queue,
    refreshQueue,
    resetQueue,
    skipToken,
    socketConnected,
    stats,
  } = useQueue();
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      if (!token) {
        return;
      }

      try {
        setBookingsLoading(true);
        const response = await getBookings(token);

        if (!cancelled) {
          setBookings(response.bookings);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message);
        }
      } finally {
        if (!cancelled) {
          setBookingsLoading(false);
        }
      }
    }

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [token, stats.totalTokens, stats.completedTokens, currentServing?.tokenNumber]);

  if (loading) {
    return <LoadingScreen label="Loading admin operations..." />;
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === "all" ? true : booking.status === filter;
    const matchesSearch = deferredSearch
      ? `${booking.tokenNumber} ${booking.serviceName} ${booking.timeSlot || ""}`
          .toLowerCase()
          .includes(deferredSearch.toLowerCase())
      : true;

    return matchesFilter && matchesSearch;
  });

  async function handleResetQueue() {
    const shouldReset = window.confirm(
      "Reset the full queue and remove all tokens?",
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
        description="Advance callers, skip inactive tokens, and monitor every booking from a single responsive dashboard."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total tokens"
            value={stats.totalTokens}
            description="All bookings created today"
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
      </GlassPanel>

      <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel
          eyebrow="Controls"
          title="Queue actions"
          description="Use these controls to keep the service line moving."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              className="primary-button h-12"
              disabled={busyAction === "next"}
              onClick={nextToken}
            >
              {busyAction === "next" ? "Calling next..." : "Next token"}
            </button>
            <button
              type="button"
              className="secondary-button h-12"
              disabled={busyAction === "skip"}
              onClick={skipToken}
            >
              {busyAction === "skip" ? "Skipping token..." : "Skip token"}
            </button>
            <button
              type="button"
              className="secondary-button h-12"
              onClick={() => refreshQueue({ silent: false })}
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
        />
      </div>

      <QueueTable
        title="Active queue"
        description="Serving and waiting tokens update automatically as bookings are created or the queue advances."
        tokens={queue}
        emptyMessage="No active tokens in the queue right now."
      />

      <GlassPanel
        eyebrow="Manage Bookings"
        title="All bookings"
        description="Filter and search the booking ledger to review queue activity."
        className="p-0"
      >
        <div className="grid gap-4 border-b border-white/10 px-6 py-6 sm:grid-cols-[1fr_auto] sm:px-8">
          <input
            className="soft-input"
            placeholder="Search by token, service, or slot"
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
                  <th className="px-6 py-4 sm:px-8">Service</th>
                  <th className="px-6 py-4 sm:px-8">Slot</th>
                  <th className="px-6 py-4 sm:px-8">Status</th>
                  <th className="px-6 py-4 sm:px-8">Ahead</th>
                  <th className="px-6 py-4 sm:px-8">ETA</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-white/[0.06] text-sm text-slate-200 last:border-b-0"
                  >
                    <td className="px-6 py-4 font-semibold text-white sm:px-8">
                      {booking.tokenNumber}
                    </td>
                    <td className="px-6 py-4 sm:px-8">{booking.serviceName}</td>
                    <td className="px-6 py-4 sm:px-8">{booking.timeSlot || "Instant"}</td>
                    <td className="px-6 py-4 capitalize sm:px-8">{booking.status}</td>
                    <td className="px-6 py-4 sm:px-8">{booking.tokensAhead}</td>
                    <td className="px-6 py-4 sm:px-8">{booking.estimatedWaitingTime} min</td>
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
