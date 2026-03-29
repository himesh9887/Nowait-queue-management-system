import LiveBoard from "../../components/LiveBoard";
import QueueTable from "../../components/QueueTable";
import LoadingScreen from "../../components/LoadingScreen";
import { useQueue } from "../../context/QueueContext";

export default function DisplayBoard() {
  const { currentServing, loading, nextUp, queue, stats } = useQueue();

  if (loading) {
    return <LoadingScreen label="Loading display board..." />;
  }

  return (
    <div className="space-y-6">
      <LiveBoard currentServing={currentServing} nextUp={nextUp} stats={stats} />
      <QueueTable
        title="Upcoming tokens"
        description="This public board is ideal for a reception display, lobby TV, or kiosk screen."
        tokens={queue.filter((token) => token.status !== "serving").slice(0, 8)}
        emptyMessage="No upcoming tokens yet."
      />
    </div>
  );
}
