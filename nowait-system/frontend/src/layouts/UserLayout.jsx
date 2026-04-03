import toast from "react-hot-toast";
import { Outlet } from "react-router-dom";
import Button from "../components/common/Button";
import {
  BellIcon,
  CalendarClockIcon,
  QueuePulseIcon,
  SpeakerOffIcon,
  SpeakerWaveIcon,
  TicketIcon,
  TimerIcon,
} from "../components/user/UserIcons";
import { useAuth } from "../context/AuthContext";
import { useQueue } from "../context/QueueContext";
import { formatMinutes, formatToken } from "../utils/formatters";
import { primeNotificationAudio } from "../utils/notificationAudio";

export default function UserLayout() {
  const { logout, user } = useAuth();
  const {
    currentServing,
    myToken,
    notificationSoundEnabled,
    selectedDayInfo,
    setNotificationSoundEnabled,
    socketConnected,
    stats,
  } = useQueue();
  const selectedQueueLabel = selectedDayInfo?.label || "Today";
  const waitingCount = selectedDayInfo?.waitingTokens ?? stats.waitingTokens ?? 0;
  const waitForecast = selectedDayInfo?.queueForecast ?? stats.queueForecast;
  const heroMetrics = [
    {
      label: "Active token",
      value: myToken ? formatToken(myToken.tokenNumber) : "Not booked",
      detail: myToken
        ? myToken.status === "serving"
          ? "You are being served now."
          : myToken.status === "completed"
            ? "Latest booking has completed."
            : "Track status from your dashboard."
        : "Reserve one when you are ready.",
      icon: TicketIcon,
      toneClassName: "border-cyan-300/18 bg-cyan-400/12 text-cyan-100",
    },
    {
      label: "Selected queue",
      value: selectedQueueLabel,
      detail: selectedDayInfo?.displayDate || "Day-aware booking view",
      icon: CalendarClockIcon,
      toneClassName: "border-violet-300/18 bg-violet-400/12 text-violet-100",
    },
    {
      label: "Now serving",
      value: formatToken(currentServing?.tokenNumber),
      detail: socketConnected ? "Live desk activity" : "Waiting for fresh sync",
      icon: QueuePulseIcon,
      toneClassName: "border-emerald-300/18 bg-emerald-400/12 text-emerald-100",
    },
    {
      label: "Expected pace",
      value: formatMinutes(waitForecast),
      detail: `${waitingCount} ${waitingCount === 1 ? "person" : "people"} ahead in this queue`,
      icon: TimerIcon,
      toneClassName: "border-amber-300/18 bg-amber-400/12 text-amber-100",
    },
  ];

  async function handleToggleNotificationSound() {
    const nextValue = !notificationSoundEnabled;

    setNotificationSoundEnabled(nextValue);

    if (nextValue) {
      const enabled = await primeNotificationAudio().catch(() => false);

      toast.success(
        enabled
          ? "Notification sound enabled."
          : "Sound preference saved. Your browser may require another tap before audio can play.",
      );
      return;
    }

    toast.success("Notification sound muted.");
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-5 sm:py-4 lg:px-8 lg:py-6">
        <header className="user-dashboard-hero user-layout-header mb-5 sm:mb-6">
          <div className="user-dashboard-hero-glow" />

          <div className="relative z-10 space-y-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <div className="section-label">User Queue Portal</div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    Hello, {user?.displayName || user?.username}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                    Track your token, queue pace, and next step from one cleaner command
                    center built for quick check-ins.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="user-dashboard-chip">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        socketConnected
                          ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]"
                          : "bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.6)]"
                      }`}
                    />
                    <span>{socketConnected ? "Live updates active" : "Reconnecting live data"}</span>
                  </div>

                  <div className="user-dashboard-chip">
                    {notificationSoundEnabled ? (
                      <SpeakerWaveIcon className="h-4 w-4 text-sky-200" />
                    ) : (
                      <SpeakerOffIcon className="h-4 w-4 text-slate-300" />
                    )}
                    <span>{notificationSoundEnabled ? "Alerts on" : "Alerts muted"}</span>
                  </div>

                  <div className="user-dashboard-chip">
                    <BellIcon className="h-4 w-4 text-violet-200" />
                    <span>{myToken ? "Token tracking active" : "Ready to book a token"}</span>
                  </div>
                </div>

                <div className="rounded-[1.7rem] border border-white/10 bg-white/4 p-4 shadow-[0_16px_38px_rgba(15,23,42,0.2)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="user-dashboard-label">Queue snapshot</div>
                      <div className="mt-2 text-xl font-semibold text-white">
                        {selectedQueueLabel} is {socketConnected ? "live and updating" : "syncing back up"}
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-slate-950/52 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                      {waitingCount} waiting
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Current desk token is {formatToken(currentServing?.tokenNumber)} and the
                    queue forecast is {formatMinutes(waitForecast)}.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.85rem] border border-white/10 bg-slate-950/58 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.36)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="user-dashboard-label">Quick controls</div>
                    <div className="mt-2 text-xl font-semibold text-white">
                      Stay ready for your turn
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                    {selectedQueueLabel}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/4 p-4">
                    <div className="user-dashboard-label">Current token status</div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {myToken
                        ? myToken.status === "serving"
                          ? "Move to the desk now"
                          : myToken.status === "completed"
                            ? "Latest visit completed"
                            : "You are in the live queue"
                        : "No active token yet"}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {myToken
                        ? `Token ${formatToken(myToken.tokenNumber)} will keep updating automatically.`
                        : "Book a token below when you are ready to join the queue."}
                    </p>
                  </div>

                  <div className="rounded-[1.35rem] border border-white/10 bg-white/4 p-4">
                    <div className="user-dashboard-label">Alert preference</div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {notificationSoundEnabled ? "Sound alerts enabled" : "Silent mode enabled"}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Browser audio reminders help when your turn is close.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full justify-center"
                    onClick={handleToggleNotificationSound}
                  >
                    {notificationSoundEnabled ? (
                      <SpeakerWaveIcon className="h-4 w-4" />
                    ) : (
                      <SpeakerOffIcon className="h-4 w-4" />
                    )}
                    <span>{notificationSoundEnabled ? "Mute alerts" : "Enable alerts"}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    className="w-full justify-center"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {heroMetrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <article key={metric.label} className="user-hero-metric">
                    <div className="flex items-start justify-between gap-3">
                      <div className="user-dashboard-label">{metric.label}</div>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${metric.toneClassName}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4 text-3xl font-semibold tracking-tight text-white">
                      {metric.value}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{metric.detail}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
