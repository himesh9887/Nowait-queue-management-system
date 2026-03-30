import { useEffect } from "react";
import { Link } from "react-router-dom";
import LiveBoard from "../../components/LiveBoard";
import QueueTable from "../../components/QueueTable";
import LoadingScreen from "../../components/LoadingScreen";
import { useAuth } from "../../context/AuthContext";
import { useQueue } from "../../context/QueueContext";

export default function DisplayBoard() {
  const {
    currentServing,
    loading,
    nextUp,
    queue,
    selectedDayInfo,
    setSelectedDay,
    stats,
  } = useQueue();
  const { user } = useAuth();

  useEffect(() => {
    setSelectedDay("today");
  }, [setSelectedDay]);

  if (loading) {
    return <LoadingScreen label="Loading display board..." />;
  }

  return (
    <div className="page-shell px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="glass-card flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="section-label">Public Queue Display</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Live service board
            </div>
          </div>

          <Link
            to={
              user?.role === "admin"
                ? "/admin-dashboard"
                : user?.role === "user"
                  ? "/user-dashboard"
                  : "/login"
            }
            className="secondary-button"
          >
            {user ? "Back to dashboard" : "Back to login"}
          </Link>
        </div>

        <LiveBoard
          currentServing={currentServing}
          nextUp={nextUp}
          stats={stats}
          selectedDayInfo={selectedDayInfo}
        />
        <QueueTable
          title="Upcoming tokens"
          description="This screen is optimized for lobby displays, kiosks, and shared service counters."
          tokens={queue.filter((token) => token.status !== "serving").slice(0, 8)}
          emptyMessage="No upcoming tokens yet."
          showBookedBy
        />
      </div>
    </div>
  );
}
