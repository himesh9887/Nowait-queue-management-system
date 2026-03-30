import { useEffect, useMemo } from "react";
import LoadingScreen from "../../components/LoadingScreen";
import BookingButton from "../../components/user/BookingButton";
import History from "../../components/user/History";
import QueueStatus from "../../components/user/QueueStatus";
import TokenCard from "../../components/user/TokenCard";
import WaitingCard from "../../components/user/WaitingCard";
import {
  BellIcon,
  SparkWaveIcon,
  TicketIcon,
  TimerIcon,
} from "../../components/user/UserIcons";
import { useAuth } from "../../context/AuthContext";
import { useQueue } from "../../context/QueueContext";
import { downloadInvoicePdf } from "../../utils/invoicePdf";
import { formatMinutes, formatToken } from "../../utils/formatters";
import socket from "../../services/socket";

function buildNotice(myToken, selectedDayInfo) {
  if (!myToken) {
    return {
      tone: "neutral",
      title: `No ${selectedDayInfo?.label?.toLowerCase() || "active"} token`,
      message: `Book a ${selectedDayInfo?.label?.toLowerCase() || "selected"} token to start tracking your ETA and live queue position.`,
    };
  }

  if (myToken.status === "serving") {
    return {
      tone: "priority",
      title: "It is your turn",
      message: "Head to the service desk now. Your token is currently being served.",
    };
  }

  if (myToken.status === "waiting" && myToken.tokensAhead <= 2) {
    return {
      tone: "active",
      title: "Your turn is near",
      message:
        myToken.tokensAhead === 0
          ? "You are next in line. Please stay ready."
          : `${myToken.tokensAhead} people are ahead of you. Keep an eye on the live queue.`,
    };
  }

  if (myToken.status === "completed") {
    return {
      tone: "neutral",
      title: "Token completed",
      message: "This booking has finished. You can reserve another token whenever you are ready.",
    };
  }

  return {
    tone: "neutral",
    title: "Tracking your wait",
    message: `${myToken.tokensAhead} people are ahead of you right now.`,
  };
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

  useEffect(() => {
    socket.emit("getToken");
  }, [selectedDay]);

  const notice = useMemo(
    () => buildNotice(myToken, selectedDayInfo),
    [myToken, selectedDayInfo],
  );
  const hasActiveToken = Boolean(myToken && myToken.status !== "completed");
  const headline = myToken
    ? myToken.status === "serving"
      ? "It is your turn right now."
      : myToken.status === "waiting"
        ? `${formatMinutes(myToken.estimatedWaitingTime)} until your turn.`
        : "Your last token is complete."
    : `Book a ${selectedDayInfo?.label?.toLowerCase() || "selected"} token to get your live ETA.`;

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
    return <LoadingScreen label="Loading user dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <section className="user-dashboard-hero">
        <div className="user-dashboard-hero-glow" />
        <div className="relative grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="user-dashboard-label">Queue Intelligence</div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {headline}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              NoWait keeps your token, position, invoice, and queue movement synchronized in real time so you always know when to head over.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="user-dashboard-chip">
                <BellIcon className="h-4 w-4 text-sky-200" />
                <span>{notice.title}</span>
              </div>
              <div className="user-dashboard-chip">
                <SparkWaveIcon className="h-4 w-4 text-violet-200" />
                <span>{socketConnected ? "Live queue online" : "Reconnecting to queue"}</span>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
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
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
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
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="user-hero-metric">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-sky-100">
                  <TicketIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="user-dashboard-label">My token</div>
                  <div className="mt-1 text-2xl font-semibold text-white">
                    {formatToken(myToken?.tokenNumber)}
                  </div>
                </div>
              </div>
            </div>

            <div className="user-hero-metric">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-violet-100">
                  <TimerIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="user-dashboard-label">Estimated wait</div>
                  <div className="mt-1 text-2xl font-semibold text-white">
                    {myToken?.status === "waiting"
                      ? formatMinutes(myToken.estimatedWaitingTime)
                      : myToken?.status === "serving"
                        ? "Now"
                        : "Ready"}
                  </div>
                </div>
              </div>
            </div>

            <div className="user-hero-metric">
              <div className="user-dashboard-label">Now serving</div>
              <div className="mt-3 text-3xl font-semibold text-white">
                {formatToken(currentServing?.tokenNumber)}
              </div>
              <div className="mt-2 text-sm text-slate-400">
                {selectedDayInfo?.label || "Selected"} queue
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 2xl:grid-cols-[1.04fr_0.96fr]">
        <TokenCard
          myToken={myToken}
          socketConnected={socketConnected}
          onDownloadInvoice={handleDownloadInvoice}
        />
        <WaitingCard
          myToken={myToken}
          currentServing={currentServing}
          avgServiceTime={stats.avgServiceTime}
        />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
        <QueueStatus
          currentServing={currentServing}
          queue={queue}
          socketConnected={socketConnected}
          stats={stats}
          notice={notice}
          generatedAt={generatedAt}
          selectedDayInfo={selectedDayInfo}
        />
        <BookingButton
          onBookToken={bookToken}
          booking={booking}
          socketConnected={socketConnected}
          hasActiveToken={hasActiveToken}
          myToken={myToken}
          selectedDay={selectedDay}
          selectedDayInfo={selectedDayInfo}
          daySummaries={daySummaries}
          onSelectDay={setSelectedDay}
        />
      </div>

      <History userHistory={userHistory} />
    </div>
  );
}
