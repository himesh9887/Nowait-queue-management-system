import {
  CalendarIcon,
  ChartIcon,
  CheckCircleIcon,
  ClockIcon,
  PulseIcon,
} from "./AdminIcons";
import { formatMinutes } from "../../utils/formatters";

function formatHourLabel(hour) {
  const normalizedHour = Number(hour);
  const suffix = normalizedHour >= 12 ? "PM" : "AM";
  const clockHour = normalizedHour % 12 || 12;
  const nextHour = (normalizedHour + 1) % 24;
  const nextSuffix = nextHour >= 12 ? "PM" : "AM";
  const nextClockHour = nextHour % 12 || 12;

  return `${clockHour}${suffix} - ${nextClockHour}${nextSuffix}`;
}

function getAverageWait(bookings, fallbackValue) {
  const waitSamples = bookings
    .map((booking) => {
      if (!booking.createdAt || (!booking.calledAt && !booking.completedAt)) {
        return null;
      }

      const start = new Date(booking.createdAt).getTime();
      const served = new Date(booking.calledAt || booking.completedAt).getTime();
      const diff = Math.round((served - start) / 60000);

      return Number.isFinite(diff) && diff >= 0 ? diff : null;
    })
    .filter((value) => value !== null);

  if (!waitSamples.length) {
    return fallbackValue || 0;
  }

  return Math.round(
    waitSamples.reduce((total, value) => total + value, 0) / waitSamples.length,
  );
}

export default function Analytics({ bookings, selectedDayInfo, stats }) {
  const totalBookings = bookings.length;
  const completedCount = bookings.filter((booking) => booking.status === "completed").length;
  const servedCount = bookings.filter(
    (booking) => booking.status === "completed" && !booking.wasSkipped,
  ).length;
  const skippedCount = bookings.filter((booking) => booking.wasSkipped).length;
  const averageWait = getAverageWait(bookings, stats.avgServiceTime);
  const completionRate = totalBookings
    ? Math.round((completedCount / totalBookings) * 100)
    : 0;
  const statusBreakdown = [
    {
      label: "Waiting",
      value: stats.waitingTokens,
      colorClassName: "bg-cyan-300",
      toneClassName: "text-cyan-100",
    },
    {
      label: "Serving",
      value: stats.activeQueue - stats.waitingTokens,
      colorClassName: "bg-emerald-300",
      toneClassName: "text-emerald-100",
    },
    {
      label: "Completed",
      value: completedCount,
      colorClassName: "bg-violet-300",
      toneClassName: "text-violet-100",
    },
  ];
  const hourlyLoadMap = bookings.reduce((accumulator, booking) => {
    if (!booking.createdAt) {
      return accumulator;
    }

    const hour = new Date(booking.createdAt).getHours();
    const nextCount = (accumulator.get(hour) || 0) + 1;
    accumulator.set(hour, nextCount);
    return accumulator;
  }, new Map());
  const hourlyLoad = Array.from(hourlyLoadMap.entries())
    .sort(([firstHour], [secondHour]) => firstHour - secondHour)
    .map(([hour, count]) => ({
      hour,
      count,
      label: formatHourLabel(hour),
    }));
  const peakSlot = hourlyLoad.reduce(
    (best, current) => (current.count > best.count ? current : best),
    { count: 0, label: "No peak yet" },
  );
  const peakShare = Math.max(...hourlyLoad.map((item) => item.count), 1);
  const metrics = [
    {
      label: "Average wait time",
      value: formatMinutes(averageWait),
      icon: ClockIcon,
      iconClassName: "border-cyan-300/18 bg-cyan-400/12 text-cyan-100",
    },
    {
      label: "Peak hour",
      value: peakSlot.label,
      icon: ChartIcon,
      iconClassName: "border-violet-300/18 bg-violet-400/12 text-violet-100",
    },
    {
      label: "Total users served",
      value: servedCount,
      icon: CheckCircleIcon,
      iconClassName: "border-emerald-300/18 bg-emerald-400/12 text-emerald-100",
    },
    {
      label: "Skipped tokens",
      value: skippedCount,
      icon: PulseIcon,
      iconClassName: "border-amber-300/18 bg-amber-400/12 text-amber-100",
    },
  ];

  return (
    <section className="admin-panel admin-fade-up">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="admin-kicker">Analytics</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Queue performance for {selectedDayInfo?.label?.toLowerCase() || "today"}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Track average wait time, service completion, and the busiest windows
            from the live booking feed.
          </p>
        </div>

        <div className="admin-chip w-full justify-center sm:w-auto">
          <CalendarIcon className="h-4 w-4 text-cyan-200" />
          {selectedDayInfo?.displayDate || "Selected day"}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.label} className="admin-surface">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-300">{metric.label}</div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${metric.iconClassName}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 text-2xl font-semibold tracking-tight text-white">
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[1.85rem] border border-white/10 bg-slate-950/62 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-slate-200">Peak hours</div>
              <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                Booking creation by hour
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              {peakSlot.count} bookings
            </div>
          </div>

          {hourlyLoad.length ? (
            <div className="mt-8 overflow-x-auto pb-2">
              <div className="flex h-64 min-w-[32rem] items-end gap-3 sm:min-w-0">
                {hourlyLoad.map((item) => (
                  <div
                    key={item.label}
                    className="flex min-w-0 flex-1 flex-col items-center gap-3"
                  >
                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-[1.25rem] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(56,189,248,0.92),rgba(6,182,212,0.38))] shadow-[0_18px_40px_rgba(34,211,238,0.18)]"
                        style={{
                          height: `${Math.max((item.count / peakShare) * 100, 12)}%`,
                        }}
                      />
                    </div>
                    <div className="text-center text-xs leading-5 text-slate-400">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[1.55rem] border border-dashed border-white/12 bg-white/3 px-6 py-10 text-center text-sm text-slate-400">
              Analytics will populate as soon as bookings arrive for this day.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.85rem] border border-white/10 bg-slate-950/62 p-5">
            <div className="text-sm font-medium text-slate-200">Status mix</div>
            <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
              Current queue distribution
            </div>

            <div className="mt-6 space-y-4">
              {statusBreakdown.map((item) => {
                const total = Math.max(totalBookings, 1);
                const percent = Math.round((item.value / total) * 100);

                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-300">{item.label}</span>
                      <span className={item.toneClassName}>
                        {item.value} ({percent}%)
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6">
                      <div
                        className={`h-full rounded-full ${item.colorClassName}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.85rem] border border-white/10 bg-white/4 p-5">
            <div className="text-sm font-medium text-slate-200">Service health</div>
            <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
              Completion and forecast
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/58 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Completion rate
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {completionRate}%
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/58 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Queue forecast
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {formatMinutes(stats.queueForecast)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
