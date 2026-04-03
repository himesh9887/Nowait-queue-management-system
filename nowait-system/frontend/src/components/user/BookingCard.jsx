import { formatMinutes, formatToken } from "../../utils/formatters";
import Button from "../common/Button";
import { CalendarClockIcon, SparkWaveIcon } from "./UserIcons";

export default function BookingCard({
  booking,
  daySummaries,
  hasActiveToken,
  myToken,
  onBookToken,
  onSelectDay,
  selectedDay,
  selectedDayInfo,
  socketConnected,
}) {
  const summary =
    daySummaries.find((item) => item.relativeLabel === selectedDay) || selectedDayInfo;

  async function handleBook() {
    await onBookToken({
      bookingDay: selectedDay,
    });
  }

  return (
    <section className="user-dashboard-card space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="section-label">Book A Token</div>
          <h2 className="heading-md mt-2">
            {hasActiveToken
              ? `Active token ${formatToken(myToken?.tokenNumber)}`
              : "Choose when you want to join the queue"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Pick a day, review queue load, and confirm your visit from this panel.
          </p>
        </div>

        <div className="user-dashboard-chip">
          <span
            className={`h-2 w-2 rounded-full ${
              socketConnected
                ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]"
                : "bg-slate-500"
            }`}
          />
          <span className="text-xs font-medium">
            {socketConnected ? "Booking available" : "Waiting for sync"}
          </span>
        </div>
      </div>

      {hasActiveToken ? (
        <div className="user-notice-card user-notice-card-active">
          <SparkWaveIcon className="mt-0.5 h-5 w-5 shrink-0 text-sky-200" />
          <div>
            <div className="text-sm font-semibold text-white">
              You already have an active token
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              Finish token {formatToken(myToken?.tokenNumber)} before booking a new one.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {daySummaries.map((day) => {
          const active = day.relativeLabel === selectedDay;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => onSelectDay(day.relativeLabel)}
              className={`rounded-3xl border p-4 text-left transition duration-300 ${
                active
                  ? "border-sky-300/35 bg-[linear-gradient(145deg,rgba(56,189,248,0.12),rgba(9,14,27,0.9)_55%)] shadow-[0_18px_40px_rgba(14,165,233,0.12)]"
                  : "border-white/10 bg-slate-950/40 hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-950/55"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">{day.label}</div>
                  <div className="mt-1 text-sm text-slate-400">{day.displayDate}</div>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    active
                      ? "bg-sky-400/12 text-sky-100 ring-1 ring-sky-300/25"
                      : "bg-white/5 text-slate-300 ring-1 ring-white/10"
                  }`}
                >
                  {active ? "Selected" : "Available"}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] border border-white/8 bg-slate-950/48 p-3">
                  <div className="card-label">Waiting</div>
                  <div className="mt-2 text-lg font-semibold text-white">{day.waitingTokens}</div>
                </div>
                <div className="rounded-[1.2rem] border border-white/8 bg-slate-950/48 p-3">
                  <div className="card-label">Serving</div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {formatToken(day.currentServingToken)}
                  </div>
                </div>
                <div className="rounded-[1.2rem] border border-white/8 bg-slate-950/48 p-3">
                  <div className="card-label">ETA</div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {day.queueForecast ? formatMinutes(day.queueForecast) : "--"}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="user-simple-panel">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <CalendarClockIcon className="h-4 w-4" />
              <span>{selectedDayInfo?.label || "Selected"} queue overview</span>
            </div>
            <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              {summary?.displayDate || "--"}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="user-simple-stat">
              <div className="card-label">People waiting</div>
              <div className="mt-1 text-lg font-semibold text-white">
                {summary?.waitingTokens ?? 0}
              </div>
            </div>
            <div className="user-simple-stat">
              <div className="card-label">Now serving</div>
              <div className="mt-1 text-lg font-semibold text-white">
                {formatToken(summary?.currentServingToken)}
              </div>
            </div>
            <div className="user-simple-stat">
              <div className="card-label">Estimated wait</div>
              <div className="mt-1 text-lg font-semibold text-white">
                {summary?.queueForecast ? formatMinutes(summary.queueForecast) : "--"}
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Only one active token can be booked at a time, so the dashboard always stays easy to follow.
          </p>
        </div>

        <div className="rounded-[1.85rem] border border-white/10 bg-[linear-gradient(145deg,rgba(56,189,248,0.12),rgba(11,17,34,0.9)_48%,rgba(8,11,24,0.96))] p-5 shadow-[0_18px_42px_rgba(15,23,42,0.22)]">
          <div className="section-label">Booking Action</div>
          <div className="mt-3 text-xl font-semibold text-white">
            {hasActiveToken ? "Finish your current visit first" : `Book for ${selectedDayInfo?.label || "today"}`}
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {hasActiveToken
              ? "Your existing token keeps priority and continues updating live until it completes."
              : "When you confirm, the selected queue day becomes your active token and starts tracking immediately."}
          </p>

          <div className="mt-4 space-y-2">
            <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/48 px-4 py-3 text-sm text-slate-300">
              Selected day: {summary?.label || selectedDayInfo?.label || "Today"}
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/48 px-4 py-3 text-sm text-slate-300">
              Live status: {socketConnected ? "Realtime sync active" : "Waiting for queue sync"}
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/48 px-4 py-3 text-sm text-slate-300">
              Queue pace: {summary?.queueForecast ? formatMinutes(summary.queueForecast) : "Up next"}
            </div>
          </div>

          <Button
            type="button"
            loading={booking}
            disabled={hasActiveToken || !socketConnected}
            onClick={handleBook}
            variant="primary"
            className="mt-5 w-full justify-center"
          >
            {booking
              ? "Booking..."
              : hasActiveToken
                ? "Token already booked"
                : `Book ${selectedDayInfo?.label || "token"}`}
          </Button>
        </div>
      </div>
    </section>
  );
}
