import {
  formatDateTime,
  formatMinutes,
  formatToken,
} from "../../utils/formatters";

export default function QueueCard({
  currentServing,
  generatedAt,
  queue,
  selectedDayInfo,
  socketConnected,
}) {
  const upcomingTokens = queue.filter((token) => token.status !== "serving").slice(0, 4);

  return (
    <section className="user-dashboard-card space-y-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="section-label">Live Queue</div>
          <h2 className="heading-md mt-2">Desk activity right now</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            See what token is being served, how many people are waiting, and who is
            expected next.
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
          <span className="text-xs font-medium">{socketConnected ? "Live" : "Reconnecting"}</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-[1.85rem] border border-emerald-300/18 bg-[linear-gradient(155deg,rgba(16,185,129,0.16),rgba(8,11,21,0.92)_55%)] p-5">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative z-10">
            <div className="card-label text-emerald-100/80">Now serving</div>
            <div className="mt-4 break-words text-[clamp(3rem,14vw,4.6rem)] font-semibold tracking-tight text-white">
              {formatToken(currentServing?.tokenNumber)}
            </div>
            <div className="mt-3 text-sm leading-6 text-emerald-50/85">
              {selectedDayInfo?.label || "Selected"} queue is currently at the live desk.
            </div>
            <div className="mt-5 rounded-[1.25rem] border border-emerald-300/18 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-50">
              Updated {formatDateTime(generatedAt)}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="user-simple-stat">
            <div className="card-label">Queue day</div>
            <div className="mt-2 text-3xl font-bold text-white">
              {selectedDayInfo?.label || "Today"}
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {selectedDayInfo?.displayDate || "Selected queue date"}
            </div>
          </div>

          <div className="user-simple-stat">
            <div className="card-label">People in queue</div>
            <div className="mt-2 text-3xl font-bold text-white">
              {selectedDayInfo?.waitingTokens ?? queue.length}
            </div>
            <div className="mt-2 text-sm text-slate-400">Active waiting tokens</div>
          </div>

          <div className="user-simple-stat">
            <div className="card-label">Queue forecast</div>
            <div className="mt-2 text-3xl font-bold text-white">
              {selectedDayInfo?.queueForecast ? formatMinutes(selectedDayInfo.queueForecast) : "--"}
            </div>
            <div className="mt-2 text-sm text-slate-400">
              Pace for this queue day
            </div>
          </div>
        </div>
      </div>

      <div className="user-simple-panel">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Upcoming tokens</div>
            <div className="mt-1 text-xs text-slate-500">
              Next customers expected after the current service finishes
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            {selectedDayInfo?.label || "Live"}
          </div>
        </div>

        <div className="space-y-3">
          {upcomingTokens.length ? (
            upcomingTokens.map((token, index) => (
              <div key={token.id} className="user-list-row">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/70 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {formatToken(token.tokenNumber)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Position #{token.queuePosition || token.position || "-"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-left sm:items-end sm:text-right">
                  <div className="rounded-full border border-cyan-300/18 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-50">
                    {token.status}
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {formatMinutes(token.estimatedWaitingTime)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="user-simple-panel-muted text-center text-sm text-slate-400">
              No waiting tokens right now.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
