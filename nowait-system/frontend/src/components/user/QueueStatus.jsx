import {
  formatDateTime,
  formatMinutes,
  formatToken,
} from "../../utils/formatters";
import {
  BellIcon,
  ChartIcon,
  QueuePulseIcon,
  SparkWaveIcon,
} from "./UserIcons";

export default function QueueStatus({
  currentServing,
  queue,
  socketConnected,
  stats,
  notice,
  generatedAt,
  selectedDayInfo,
}) {
  const upcomingTokens = queue.filter((token) => token.status !== "serving").slice(0, 4);

  return (
    <section className="user-dashboard-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="user-dashboard-label">Live Queue Status</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {selectedDayInfo?.label || "Selected"} service desk pulse
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
            Track the current serving token, upcoming queue movement, and live system activity without refreshing.
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
          <span>{socketConnected ? "Realtime online" : "Realtime reconnecting"}</span>
        </div>
      </div>

      {notice ? (
        <div
          className={`user-notice-card mt-6 ${
            notice.tone === "priority"
              ? "user-notice-card-priority"
              : notice.tone === "active"
                ? "user-notice-card-active"
                : "user-notice-card-neutral"
          }`}
        >
          <BellIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold text-white">{notice.title}</div>
            <div className="mt-1 text-sm leading-6 text-slate-200/90">
              {notice.message}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.94fr_1.06fr]">
        <div className="user-serving-board">
          <div className="flex items-center gap-3 text-sky-200">
            <QueuePulseIcon className="h-5 w-5" />
            <span className="user-dashboard-label text-sky-200/90">Now serving</span>
          </div>
          <div className="mt-6 text-[4.6rem] font-semibold leading-none tracking-tight text-white sm:text-[5.2rem]">
            {formatToken(currentServing?.tokenNumber)}
          </div>
          <div className="mt-3 text-base text-slate-300">
            {selectedDayInfo?.label || "Selected"} queue
          </div>
          <div className="mt-6 text-sm text-slate-400">
            Last queue sync: {formatDateTime(generatedAt)}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="user-metric-tile">
              <div className="flex items-center gap-2 text-slate-300">
                <ChartIcon className="h-[18px] w-[18px] text-violet-200" />
                <span className="user-dashboard-label text-slate-300">Avg service time</span>
              </div>
              <div className="mt-3 text-2xl font-semibold text-white">
                {formatMinutes(stats.avgServiceTime)}
              </div>
            </div>
            <div className="user-metric-tile">
              <div className="flex items-center gap-2 text-slate-300">
                <SparkWaveIcon className="h-[18px] w-[18px] text-sky-200" />
                <span className="user-dashboard-label text-slate-300">
                  {selectedDayInfo?.label || "Selected"} tokens
                </span>
              </div>
              <div className="mt-3 text-2xl font-semibold text-white">
                {stats.totalTokens}
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/[0.55] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium text-white">Upcoming queue</div>
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                {queue.length} active
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingTokens.length ? (
                upcomingTokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between gap-4 rounded-[1.15rem] border border-white/[0.06] bg-white/[0.03] px-4 py-3"
                  >
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {formatToken(token.tokenNumber)}
                      </div>
                      <div className="mt-1 text-sm text-slate-400">
                        Queue position #{token.queuePosition || token.position || "-"}
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-300">
                      <div>{formatMinutes(token.estimatedWaitingTime)}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                        {token.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.15rem] border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-slate-400">
                  No waiting tokens in the queue right now.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
