import BookingCard from "../../components/user/BookingCard";
import HistoryCard from "../../components/user/HistoryCard";
import InvoiceCard from "../../components/user/InvoiceCard";
import QueueCard from "../../components/user/QueueCard";
import TokenCard from "../../components/user/TokenCard";
import WaitingCard from "../../components/user/WaitingCard";
import { BellIcon, SparkWaveIcon } from "../../components/user/UserIcons";
import { useAuth } from "../../context/AuthContext";
import { useQueue } from "../../context/QueueContext";
import { downloadInvoicePdf } from "../../utils/invoicePdf";
import { formatMinutes, formatToken } from "../../utils/formatters";

function UserDashboardSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="user-dashboard-hero animate-pulse">
        <div className="user-dashboard-hero-glow" />
        <div className="relative grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <div className="h-4 w-40 rounded-full bg-white/10" />
            <div className="h-12 max-w-2xl rounded-[1.3rem] bg-white/10" />
            <div className="h-24 max-w-3xl rounded-[1.5rem] bg-white/6" />
            <div className="flex flex-wrap gap-3">
              <div className="h-11 w-44 rounded-full bg-white/8" />
              <div className="h-11 w-40 rounded-full bg-white/8" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-36 rounded-[1.6rem] bg-white/8" />
            <div className="h-36 rounded-[1.6rem] bg-white/8" />
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-96 rounded-[2rem] border border-white/10 bg-white/[0.04] animate-pulse" />
        <div className="h-96 rounded-[2rem] border border-white/10 bg-white/[0.04] animate-pulse" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-80 rounded-[2rem] border border-white/10 bg-white/[0.04] animate-pulse" />
        <div className="h-80 rounded-[2rem] border border-white/10 bg-white/[0.04] animate-pulse" />
      </div>
    </div>
  );
}

function getHeadline(myToken, selectedDayInfo) {
  if (!myToken) {
    return `Reserve your ${selectedDayInfo?.label?.toLowerCase() || "selected"} token.`;
  }

  if (myToken.status === "serving") {
    return "It is your turn right now.";
  }

  if (myToken.status === "waiting") {
    return `${formatMinutes(myToken.estimatedWaitingTime)} until your turn.`;
  }

  return "Your latest token has been completed.";
}

function getSupportCopy(myToken, selectedDayInfo) {
  if (!myToken) {
    return `Book a ${selectedDayInfo?.label?.toLowerCase() || "selected"} token to unlock your live queue status, waiting time, invoice, and booking history.`;
  }

  if (myToken.status === "serving") {
    return "Your token is being served now. Keep this screen open in case you need your invoice or booking details.";
  }

  if (myToken.status === "waiting") {
    return `${myToken.tokensAhead} ${myToken.tokensAhead === 1 ? "person is" : "people are"} ahead of you, and your queue position will keep updating automatically.`;
  }

  return "Your completed booking details remain available below, and you can book a new token whenever you are ready.";
}

function getNotice(myToken, socketConnected) {
  if (!socketConnected) {
    return "Realtime sync is reconnecting.";
  }

  if (!myToken) {
    return "No active token yet.";
  }

  if (myToken.status === "serving") {
    return "Head to the desk now.";
  }

  if (myToken.status === "waiting" && myToken.tokensAhead <= 2) {
    return "Your turn is near.";
  }

  if (myToken.status === "completed") {
    return "Booking completed successfully.";
  }

  return "Live tracking is active.";
}

export default function UserDashboard() {
  const { user } = useAuth();
  const {
    booking,
    bookToken,
    currentServing,
    daySummaries,
    generatedAt,
    loading,
    myToken,
    queue,
    selectedDay,
    selectedDayInfo,
    setSelectedDay,
    socketConnected,
    stats,
    userHistory,
  } = useQueue();
  const hasToken = Boolean(myToken);
  const hasActiveToken = Boolean(myToken && myToken.status !== "completed");
  const historyItems = userHistory.filter(
    (item) => item.id !== myToken?.id && item.status === "completed",
  );
  const headline = getHeadline(myToken, selectedDayInfo);
  const supportCopy = getSupportCopy(myToken, selectedDayInfo);
  const notice = getNotice(myToken, socketConnected);

  function handleDownloadInvoice() {
    if (!myToken) {
      return;
    }

    downloadInvoicePdf({
      userName: user?.displayName || user?.username,
      tokenNumber: myToken.tokenNumber,
      bookingDate: myToken.bookingDate,
      bookingLabel: myToken.bookingLabel,
      estimatedTime: myToken.estimatedWaitingTime,
      queuePosition: myToken.queuePosition || myToken.position,
      status: myToken.status,
    });
  }

  if (loading) {
    return <UserDashboardSkeleton />;
  }

  if (!hasToken) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <BookingCard
          booking={booking}
          daySummaries={daySummaries}
          hasActiveToken={hasActiveToken}
          myToken={myToken}
          onBookToken={bookToken}
          onSelectDay={setSelectedDay}
          selectedDay={selectedDay}
          selectedDayInfo={selectedDayInfo}
          socketConnected={socketConnected}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="user-dashboard-hero">
        <div className="user-dashboard-hero-glow" />
        <div className="relative grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <div>
              <div className="section-label">Personal Queue Console</div>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {headline}
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-slate-300">
              {supportCopy}
            </p>

            <div className="flex flex-wrap gap-2">
              <div className="user-dashboard-chip">
                <BellIcon className="h-4 w-4 text-sky-200" />
                <span className="text-sm">{notice}</span>
              </div>
              <div className="user-dashboard-chip">
                <SparkWaveIcon className="h-4 w-4 text-violet-200" />
                <span className="text-sm">{socketConnected ? "Live queue online" : "Reconnecting to queue"}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {daySummaries.map((day) => {
              const active = day.relativeLabel === selectedDay;

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDay(day.relativeLabel)}
                  className={`rounded-xl border p-4 transition ${
                    active
                      ? "border-cyan-400/40 bg-cyan-400/10 shadow-lg shadow-cyan-400/10"
                      : "border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-slate-950/50"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-base font-semibold text-white">{day.label}</div>
                    <div className="text-xs text-slate-400">{day.displayDate}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-slate-300">
                    <div>
                      <div className="card-label">My token</div>
                      <div className="mt-1 text-lg font-semibold text-white">
                        {day.relativeLabel === selectedDay
                          ? formatToken(myToken?.tokenNumber)
                          : "---"}
                      </div>
                    </div>
                    <div>
                      <div className="card-label">Waiting</div>
                      <div className="mt-1 text-lg font-semibold text-white">
                        {day.waitingTokens}
                      </div>
                    </div>
                    <div>
                      <div className="card-label">Serving</div>
                      <div className="mt-1 text-lg font-semibold text-white">
                        {formatToken(day.currentServingToken)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <TokenCard
          myToken={myToken}
          selectedDayInfo={selectedDayInfo}
          socketConnected={socketConnected}
        />
        <WaitingCard
          avgServiceTime={stats.avgServiceTime}
          currentServing={currentServing}
          generatedAt={generatedAt}
          myToken={myToken}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <QueueCard
          currentServing={currentServing}
          generatedAt={generatedAt}
          queue={queue}
          selectedDayInfo={selectedDayInfo}
          socketConnected={socketConnected}
        />
        <InvoiceCard
          myToken={myToken}
          onDownloadInvoice={handleDownloadInvoice}
          userName={user?.displayName || user?.username || "NoWait User"}
        />
      </div>

      <BookingCard
        booking={booking}
        daySummaries={daySummaries}
        hasActiveToken={hasActiveToken}
        myToken={myToken}
        onBookToken={bookToken}
        onSelectDay={setSelectedDay}
        selectedDay={selectedDay}
        selectedDayInfo={selectedDayInfo}
        socketConnected={socketConnected}
      />

      <HistoryCard items={historyItems} />
    </div>
  );
}
