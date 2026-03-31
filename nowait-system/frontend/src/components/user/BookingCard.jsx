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
    <section className="user-dashboard-card user-dashboard-card-strong space-y-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="section-label">Book A Token</div>
          <h2 className="heading-md mt-2">
            {hasActiveToken
              ? `Active token ${formatToken(myToken?.tokenNumber)}`
              : "Choose when you want to join the queue"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Select a day, review the live load, and confirm your booking when you are ready.
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
          <span className="text-xs font-medium">{socketConnected ? "Booking available" : "Waiting for sync"}</span>
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
              className={`rounded-3xl border p-5 text-left transition ${
                active
                  ? "border-sky-300/35 bg-sky-400/10 shadow-[0_18px_40px_rgba(14,165,233,0.12)]"
                  : "border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-slate-950/55"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{day.label}</div>
                  <div className="mt-1 text-xs text-slate-400">{day.displayDate}</div>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    active
                      ? "bg-sky-400/12 text-sky-100 ring-1 ring-sky-300/25"
                      : "bg-white/5 text-slate-300 ring-1 ring-white/10"
                  }`}
                >
                  {active ? "Selected" : "Tap to choose"}
                </div>
              </div>

              <div className="mt-4 text-sm leading-relaxed text-slate-300">
                {day.canServe
                  ? "Join the active service queue and get a live ETA immediately."
                  : "Reserve tomorrow in advance so you are ready before service starts."}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                  <div className="card-label">Waiting</div>
                  <div className="mt-1 text-lg font-semibold text-white">{day.waitingTokens}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                  <div className="card-label">Serving</div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {formatToken(day.currentServingToken)}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                  <div className="card-label">ETA</div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {day.queueForecast ? formatMinutes(day.queueForecast) : "--"}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/62 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <CalendarClockIcon className="h-4 w-4" />
            <span>{selectedDayInfo?.label || "Selected"} queue overview</span>
          </div>
          <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            {summary?.displayDate || "--"}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="card-label">People waiting</div>
            <div className="mt-1 text-lg font-semibold text-white">
              {summary?.waitingTokens ?? 0}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="card-label">Now serving</div>
            <div className="mt-1 text-lg font-semibold text-white">
              {formatToken(summary?.currentServingToken)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="card-label">Estimated entry</div>
            <div className="mt-1 text-lg font-semibold text-white">
              {summary?.queueForecast ? formatMinutes(summary.queueForecast) : "--"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-6 text-slate-400">
          Only one active token can be booked at a time. Your place is assigned instantly once booking succeeds.
        </p>

        <Button
          type="button"
          loading={booking}
          disabled={hasActiveToken || !socketConnected}
          onClick={handleBook}
          variant="primary"
          className="w-full justify-center sm:min-w-55 sm:w-auto"
        >
          {booking
            ? "Booking..."
            : hasActiveToken
              ? "Token already booked"
              : `Book ${selectedDayInfo?.label || "token"}`}
        </Button>
      </div>
    </section>
  );
}
