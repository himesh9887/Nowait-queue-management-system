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
    <section className="user-dashboard-card user-dashboard-card-strong">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="user-dashboard-label">Book Token</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {hasActiveToken
              ? `You already have token ${formatToken(myToken?.tokenNumber)} in this queue`
              : `Reserve your ${selectedDayInfo?.label?.toLowerCase() || "selected"} token`}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Choose today or tomorrow, and NoWait will assign the next available token
            automatically with a live ETA.
          </p>
        </div>

        <div className="user-dashboard-chip">
          <span
            className={`h-2 w-2 rounded-full ${
              socketConnected
                ? "bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.85)]"
                : "bg-slate-500"
            }`}
          />
          <span>{socketConnected ? "Booking ready" : "Booking syncing"}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {daySummaries.map((day) => {
          const active = day.relativeLabel === selectedDay;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => onSelectDay(day.relativeLabel)}
              className={`rounded-[1.4rem] border p-4 text-left transition duration-300 ${
                active
                  ? "border-sky-300/22 bg-[linear-gradient(135deg,rgba(56,189,248,0.16),rgba(129,140,248,0.14),rgba(168,85,247,0.12))] shadow-[0_16px_34px_rgba(56,189,248,0.12)]"
                  : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold text-white">{day.label}</div>
                <div className="text-xs uppercase tracking-[0.22em] text-sky-200/90">
                  {day.displayDate}
                </div>
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                {day.canServe
                  ? "Join the current service queue for today."
                  : "Reserve early. Tomorrow stays separated until tomorrow starts."}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <span>{day.waitingTokens} waiting</span>
                <span>{day.completedTokens} completed</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[1.45rem] border border-white/10 bg-slate-950/[0.58] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-sky-100">
            <CalendarClockIcon className="h-5 w-5" />
            <span>{selectedDayInfo?.label || "Selected"} queue snapshot</span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="user-dashboard-label">People waiting</div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {summary?.waitingTokens ?? 0}
              </div>
            </div>
            <div>
              <div className="user-dashboard-label">Estimated entry</div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {formatMinutes(summary?.queueForecast ?? 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.45rem] border border-white/10 bg-slate-950/[0.58] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-sky-100">
            <SparkWaveIcon className="h-5 w-5" />
            <span>Booking summary</span>
          </div>
          <div className="mt-4 text-sm leading-7 text-slate-300">
            {hasActiveToken ? (
              <>
                Token <span className="font-semibold text-white">{formatToken(myToken?.tokenNumber)}</span> is
                already active for {myToken?.bookingLabel?.toLowerCase() || "this queue"}.
              </>
            ) : (
              <>
                You will receive the next available token for{" "}
                <span className="font-semibold text-white">
                  {selectedDayInfo?.label || "the selected day"}
                </span>{" "}
                and the wait will keep updating live.
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Button
          type="button"
          loading={booking}
          disabled={hasActiveToken}
          onClick={handleBook}
          className="text-base"
        >
          {booking
            ? "Booking token..."
            : hasActiveToken
              ? "Active token already booked"
              : "Book Token"}
        </Button>
      </div>
    </section>
  );
}
