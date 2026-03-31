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
            <div className="h-12 max-w-2xl rounded-3xl bg-white/10" />
            <div className="h-24 max-w-3xl rounded-3xl bg-white/6" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="h-28 rounded-3xl bg-white/8" />
              <div className="h-28 rounded-3xl bg-white/8" />
              <div className="h-28 rounded-3xl bg-white/8" />
              <div className="h-28 rounded-3xl bg-white/8" />
            </div>
          </div>
          <div className="h-90 rounded-4xl bg-white/5" />
        </div>
      </section>

      <div className="h-105 rounded-4xl border border-white/10 bg-white/4 animate-pulse" />
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-96 rounded-4xl border border-white/10 bg-white/4 animate-pulse" />
        <div className="h-96 rounded-4xl border border-white/10 bg-white/4 animate-pulse" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-80 rounded-4xl border border-white/10 bg-white/4 animate-pulse" />
        <div className="h-80 rounded-4xl border border-white/10 bg-white/4 animate-pulse" />
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

function getStatusLabel(myToken) {
  if (!myToken) {
    return "Ready to book";
  }

  if (myToken.status === "serving") {
    return "Serving now";
  }

  if (myToken.status === "waiting") {
    return "Waiting";
  }

  return "Completed";
}

function getActionContent(myToken, socketConnected, selectedDayInfo) {
  if (!socketConnected) {
    return {
      title: "Connection is retrying",
      body: "Your last queue snapshot is still visible. Fresh updates will continue as soon as the live connection returns.",
      steps: [
        "Keep this page open for automatic reconnection.",
        "Avoid refreshing unless the screen stays offline for long.",
        "Watch the queue section below for the latest visible update.",
      ],
    };
  }

  if (!myToken) {
    return {
      title: `Book for ${selectedDayInfo?.label || "today"}`,
      body: "Pick a day, review the current queue load, and confirm your booking when you are ready.",
      steps: [
        "Choose today or tomorrow in the booking card.",
        "Check how many people are waiting before you join.",
        "Tap book token to reserve your place instantly.",
      ],
    };
  }

  if (myToken.status === "serving") {
    return {
      title: "Go to the service desk now",
      body: "Your token is already being served. Keep your token visible and move to the counter.",
      steps: [
        "Head to the desk immediately.",
        "Keep this screen or your token number ready.",
        "Download your invoice after service if needed.",
      ],
    };
  }

  if (myToken.status === "waiting") {
    return {
      title: "Stay ready for your turn",
      body: "Your position and ETA will keep updating here in real time while the queue moves forward.",
      steps: [
        "Keep notifications on if you want an audio alert.",
        "Check tokens ahead and countdown below.",
        "Start moving to the desk once only a few people remain.",
      ],
    };
  }

  return {
    title: "This booking is complete",
    body: "You can still review the invoice and history below, or book a fresh token when you need another visit.",
    steps: [
      "Download the invoice if you need a receipt.",
      "Review previous visits in your history.",
      "Book a new token whenever you are ready.",
    ],
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
  const hasToken = Boolean(myToken);
  const hasActiveToken = Boolean(myToken && myToken.status !== "completed");
  const historyItems = userHistory.filter(
    (item) => item.id !== myToken?.id && item.status === "completed",
  );
  const selectedSummary =
    daySummaries.find((item) => item.relativeLabel === selectedDay) || selectedDayInfo;
  const headline = getHeadline(myToken, selectedDayInfo);
  const supportCopy = getSupportCopy(myToken, selectedDayInfo);
  const notice = getNotice(myToken, socketConnected);
  const statusLabel = getStatusLabel(myToken);
  const actionContent = getActionContent(myToken, socketConnected, selectedDayInfo);
  const heroMetrics = hasToken
    ? [
        {
          label: "Token",
          value: formatToken(myToken?.tokenNumber),
          detail: myToken?.bookingLabel || selectedDayInfo?.label || "Selected queue",
        },
        {
          label: "Status",
          value: statusLabel,
          detail: socketConnected ? "Live sync active" : "Waiting for reconnection",
        },
        {
          label: myToken?.status === "waiting" ? "People ahead" : "Queue position",
          value:
            myToken?.status === "waiting"
              ? String(myToken?.tokensAhead ?? 0)
              : myToken?.status === "serving"
                ? "Now"
                : myToken?.queuePosition
                  ? `#${myToken.queuePosition}`
                  : "Done",
          detail:
            myToken?.status === "waiting"
              ? "Live queue updates"
              : myToken?.status === "serving"
                ? "Please go to desk"
                : "Booking closed",
        },
        {
          label: myToken?.status === "waiting" ? "Estimated wait" : "Booked on",
          value:
            myToken?.status === "waiting"
              ? formatMinutes(myToken?.estimatedWaitingTime)
              : selectedDayInfo?.label || myToken?.bookingLabel || "Selected day",
          detail:
            myToken?.status === "waiting"
              ? `Serving ${formatToken(currentServing?.tokenNumber)} right now`
              : "Queue day",
        },
      ]
    : [
        {
          label: "Selected day",
          value: selectedDayInfo?.label || "Today",
          detail: selectedSummary?.displayDate || "Choose your queue day",
        },
        {
          label: "Waiting now",
          value: String(selectedSummary?.waitingTokens ?? 0),
          detail: "People already in line",
        },
        {
          label: "Now serving",
          value: formatToken(selectedSummary?.currentServingToken),
          detail: "Current desk token",
        },
        {
          label: "Average pace",
          value: stats.avgServiceTime ? formatMinutes(stats.avgServiceTime) : "--",
          detail: "Typical time per token",
        },
      ];

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

  return (
    <div className="space-y-6">
      <section className="user-dashboard-hero">
        <div className="user-dashboard-hero-glow" />
        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="space-y-5">
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

            <div>
              <div className="section-label">Your Queue Summary</div>
              <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
                {headline}
              </h1>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              {supportCopy}
            </p>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {heroMetrics.map((item) => (
                <article key={item.label} className="user-hero-metric">
                  <div className="user-dashboard-label">{item.label}</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[1.85rem]">
                    {item.value}
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="user-dashboard-card user-dashboard-card-strong space-y-5 p-5 sm:p-6">
            <div>
              <div className="section-label">What To Do Now</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                {actionContent.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {actionContent.body}
              </p>
            </div>

            <div className="space-y-3">
              {actionContent.steps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-[1.35rem] border border-white/10 bg-white/4 px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-300/20 bg-sky-400/10 text-sm font-semibold text-sky-100">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-6 text-slate-200">{step}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/50 p-4">
              <div className="user-dashboard-label">Selected day</div>
              <div className="mt-2 text-lg font-semibold text-white">
                {selectedSummary?.label || selectedDayInfo?.label || "Today"}
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-400">
                <span>{selectedSummary?.displayDate || "--"}</span>
                <span>{selectedSummary?.waitingTokens ?? 0} waiting</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

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

      {hasToken ? (
        <>
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
        </>
      ) : (
        <QueueCard
          currentServing={currentServing}
          generatedAt={generatedAt}
          queue={queue}
          selectedDayInfo={selectedDayInfo}
          socketConnected={socketConnected}
        />
      )}

      <HistoryCard items={historyItems} />
    </div>
  );
}
