import BookingCard from "../../components/user/BookingCard";
import HistoryCard from "../../components/user/HistoryCard";
import InvoiceCard from "../../components/user/InvoiceCard";
import QueueCard from "../../components/user/QueueCard";
import TokenCard from "../../components/user/TokenCard";
import WaitingCard from "../../components/user/WaitingCard";
import { BellIcon } from "../../components/user/UserIcons";
import { useAuth } from "../../context/AuthContext";
import { useQueue } from "../../context/QueueContext";
import { downloadInvoicePdf } from "../../utils/invoicePdf";
import { formatMinutes, formatToken } from "../../utils/formatters";

function UserDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-78 rounded-4xl border border-white/10 bg-white/4 animate-pulse" />
      <div className="h-64 rounded-4xl border border-white/10 bg-white/4 animate-pulse" />
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-72 rounded-4xl border border-white/10 bg-white/4 animate-pulse" />
        <div className="h-72 rounded-4xl border border-white/10 bg-white/4 animate-pulse" />
      </div>
      <div className="h-72 rounded-4xl border border-white/10 bg-white/4 animate-pulse" />
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
    return `Choose ${selectedDayInfo?.label?.toLowerCase() || "a day"}, book your token, and track everything from this page.`;
  }

  if (myToken.status === "serving") {
    return "Your token is being served now. Keep your token number ready and move to the desk.";
  }

  if (myToken.status === "waiting") {
    return `${myToken.tokensAhead} ${myToken.tokensAhead === 1 ? "person is" : "people are"} ahead of you. Your status updates here automatically.`;
  }

  return "Your booking is complete. You can still review the details below or book again when needed.";
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

function getNextStep(myToken, socketConnected, selectedDayInfo) {
  if (!socketConnected) {
    return {
      title: "Wait for live sync to return",
      body: "Your latest queue snapshot is still visible. Fresh updates will continue automatically once the connection comes back.",
    };
  }

  if (!myToken) {
    return {
      title: `Book for ${selectedDayInfo?.label || "today"}`,
      body: "Use the booking card below, check the queue load, and confirm when you are ready.",
    };
  }

  if (myToken.status === "serving") {
    return {
      title: "Go to the service desk now",
      body: "Your token is already being served. Keep this page open or remember your token number.",
    };
  }

  if (myToken.status === "waiting") {
    return {
      title: myToken.tokensAhead <= 2 ? "Stay ready for your turn" : "You are in the queue",
      body:
        myToken.tokensAhead <= 2
          ? "Only a few people remain ahead of you. Stay close and keep your token number visible."
          : "Keep this page open to watch your queue position and wait time update automatically.",
    };
  }

  return {
    title: "This booking is complete",
    body: "You can review the invoice and history below, or book a fresh token when you need another visit.",
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
  const nextStep = getNextStep(myToken, socketConnected, selectedDayInfo);
  const summaryMetrics = hasToken
    ? [
        {
          label: "Token",
          value: formatToken(myToken?.tokenNumber),
          detail: myToken?.bookingLabel || selectedSummary?.label || "Selected queue",
        },
        {
          label: "Status",
          value: statusLabel,
          detail: notice,
        },
        {
          label: myToken?.status === "waiting" ? "Estimated wait" : "Queue day",
          value:
            myToken?.status === "waiting"
              ? formatMinutes(myToken?.estimatedWaitingTime)
              : myToken?.bookingLabel || selectedSummary?.label || "Selected",
          detail:
            myToken?.status === "waiting"
              ? `${myToken?.tokensAhead ?? 0} ahead of you`
              : selectedSummary?.displayDate || "Booking details below",
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
          value: formatToken(selectedSummary?.currentServingToken || currentServing?.tokenNumber),
          detail: selectedSummary?.displayDate || "Current desk token",
        },
      ];
  const quickFacts = hasToken
    ? [
        {
          label: "Selected day",
          value:
            myToken?.bookingLabel || selectedSummary?.label || selectedDayInfo?.label || "Today",
        },
        {
          label: "Queue position",
          value:
            myToken?.status === "serving"
              ? "Now"
              : myToken?.queuePosition
                ? `#${myToken.queuePosition}`
                : "Completed",
        },
        {
          label: "Now serving",
          value: formatToken(currentServing?.tokenNumber),
        },
        {
          label: "Connection",
          value: socketConnected ? "Live updates on" : "Reconnecting",
        },
      ]
    : [
        {
          label: "Selected day",
          value: selectedSummary?.label || selectedDayInfo?.label || "Today",
        },
        {
          label: "People waiting",
          value: `${selectedSummary?.waitingTokens ?? 0}`,
        },
        {
          label: "Average pace",
          value: stats.avgServiceTime ? formatMinutes(stats.avgServiceTime) : "--",
        },
        {
          label: "Connection",
          value: socketConnected ? "Live updates on" : "Reconnecting",
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
      <section className="user-dashboard-card space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="section-label">Current Status</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              {headline}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
              {supportCopy}
            </p>
          </div>

          <div className="user-dashboard-chip self-start">
            <BellIcon className="h-4 w-4 text-sky-200" />
            <span>{notice}</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {summaryMetrics.map((item) => (
            <article key={item.label} className="user-simple-stat">
              <div className="user-dashboard-label">{item.label}</div>
              <div className="mt-2 break-words text-2xl font-semibold tracking-tight text-white sm:text-[1.9rem]">
                {item.value}
              </div>
              <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="user-simple-panel">
            <div className="card-label">Next step</div>
            <div className="mt-2 text-lg font-semibold text-white">
              {nextStep.title}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {nextStep.body}
            </p>
          </div>

          <div className="user-simple-panel">
            <div className="card-label">Quick info</div>
            <div className="user-key-value-list mt-4">
              {quickFacts.map((item) => (
                <div key={item.label} className="user-key-value-row">
                  <span className="user-dashboard-label">{item.label}</span>
                  <span className="user-key-value-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
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
