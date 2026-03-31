import Button from "../common/Button";
import { formatMinutes, formatToken } from "../../utils/formatters";
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
    <section className="glass-card-strong space-y-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="section-label">Book Token</div>
          <h2 className="heading-md mt-2">
            {hasActiveToken
              ? `You have token ${formatToken(myToken?.tokenNumber)}`
              : `Book your ${selectedDayInfo?.label?.toLowerCase() || "queue"} token`}
          </h2>
          <p className="text-muted mt-2">
            Select today or tomorrow. NoWait will assign you the next available token with a live ETA.
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
          <span className="text-xs font-medium">{socketConnected ? "Booking ready" : "Syncing"}</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {daySummaries.map((day) => {
          const active = day.relativeLabel === selectedDay;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => onSelectDay(day.relativeLabel)}
              className={`rounded-xl border p-4 text-left transition ${
                active
                  ? "border-sky-300/30 bg-sky-400/10 shadow-lg shadow-sky-400/10"
                  : "border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-slate-950/50"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="font-semibold text-white">{day.label}</div>
                <div className="text-xs text-slate-400">{day.displayDate}</div>
              </div>
              <div className="text-sm text-slate-300 leading-relaxed">
                {day.canServe
                  ? "Join the current service queue for today."
                  : "Reserve early. Tomorrow stays separate until tomorrow starts."}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                <span>📊 {day.waitingTokens} in queue</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-white/8 bg-slate-950/40 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <CalendarClockIcon className="h-4 w-4" />
          <span>{selectedDayInfo?.label || "Selected"} queue</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="card-label">People waiting</div>
            <div className="mt-1 text-lg font-semibold text-white">
              {summary?.waitingTokens ?? 0}
            </div>
          </div>
          <div>
            <div className="card-label">Estimated entry</div>
            <div className="mt-1 text-lg font-semibold text-white">
              {formatMinutes(summary?.queueForecast ?? 0)}
            </div>
          </div>
        </div>
      </div>

      <Button
        type="button"
        loading={booking}
        disabled={hasActiveToken || !socketConnected}
        onClick={handleBook}
        variant="primary"
        fullWidth
      >
        {booking
          ? "Booking..."
          : hasActiveToken
            ? "Token already booked"
            : "Book Token"}
      </Button>
    </section>
  );
}
