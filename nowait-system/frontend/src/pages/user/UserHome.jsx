import BookingForm from "../../components/BookingForm";
import HeroBanner from "../../components/HeroBanner";
import LiveBoard from "../../components/LiveBoard";
import LoadingScreen from "../../components/LoadingScreen";
import QueueTable from "../../components/QueueTable";
import TokenSummary from "../../components/TokenSummary";
import { useQueue } from "../../context/QueueContext";

export default function UserHome() {
  const {
    booking,
    bookToken,
    clearTrackedToken,
    currentServing,
    loading,
    myToken,
    nextUp,
    queue,
    services,
    socketConnected,
    stats,
  } = useQueue();

  if (loading) {
    return <LoadingScreen label="Loading queue experience..." />;
  }

  return (
    <div className="space-y-6">
      <HeroBanner
        stats={stats}
        currentServing={currentServing}
        socketConnected={socketConnected}
      />

      <div className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="space-y-6">
          <BookingForm
            services={services}
            onBookToken={bookToken}
            booking={booking}
            socketConnected={socketConnected}
          />
          <TokenSummary
            myToken={myToken}
            currentServing={currentServing}
            onClear={clearTrackedToken}
            socketConnected={socketConnected}
          />
        </div>

        <div className="space-y-6">
          <LiveBoard
            currentServing={currentServing}
            nextUp={nextUp}
            stats={stats}
          />
          <QueueTable
            title="Active queue"
            description="Watch the live token order, current service, and updated waiting time estimate."
            tokens={queue}
            emptyMessage="The queue is empty right now. Book the first token to get started."
          />
        </div>
      </div>
    </div>
  );
}
