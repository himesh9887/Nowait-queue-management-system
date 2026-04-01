import {
  formatDateTime,
  formatMinutes,
  formatToken,
} from "../../utils/formatters";
import { QueuePulseIcon } from "./UserIcons";

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
            Watch the current token and upcoming queue movement without refreshing the page.
          </p>
        </div>

        <div className="user-dashboard-chip w-full sm:w-auto">
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

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="user-serving-board">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/4 text-emerald-200">
              <QueuePulseIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="user-dashboard-label">Now serving</div>
              <div className="mt-1 text-sm text-slate-400">
                {selectedDayInfo?.label || "Selected"} queue
              </div>
            </div>
          </div>

          <div className="mt-6 break-words text-[clamp(2.8rem,15vw,4.5rem)] font-bold tracking-tight text-white sm:text-6xl">
            {formatToken(currentServing?.tokenNumber)}
          </div>
          <div className="mt-3 text-sm leading-7 text-slate-300">
            This is the token currently being handled at the desk.
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="user-metric-tile">
              <div className="card-label">Waiting in line</div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {selectedDayInfo?.waitingTokens ?? queue.length}
              </div>
            </div>
            <div className="user-metric-tile">
              <div className="card-label">Last update</div>
              <div className="mt-2 text-sm font-semibold text-white">
                {formatDateTime(generatedAt)}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="user-metric-tile">
              <div className="card-label">Queue size</div>
              <div className="mt-2 text-2xl font-bold text-white">{queue.length}</div>
              <div className="mt-2 text-xs text-slate-500">active tokens</div>
            </div>

            <div className="user-metric-tile">
              <div className="card-label">Queue flow</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {upcomingTokens.length ? "Moving" : "Quiet"}
              </div>
              <div className="mt-2 text-xs text-slate-500">live status</div>
            </div>

            <div className="user-metric-tile">
              <div className="card-label">Forecast</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {selectedDayInfo?.queueForecast ? formatMinutes(selectedDayInfo.queueForecast) : "--"}
              </div>
              <div className="mt-2 text-xs text-slate-500">estimated queue span</div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/62 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">Upcoming tokens</div>
                <div className="mt-1 text-xs text-slate-500">
                  Next people expected after the current service
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                {selectedDayInfo?.label || "Live"}
              </div>
            </div>

            <div className="space-y-3">
              {upcomingTokens.length ? (
                upcomingTokens.map((token, index) => (
                  <div
                    key={token.id}
                    className="flex flex-col items-start gap-4 rounded-[1.2rem] border border-white/8 bg-white/3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
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

                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">
                        {formatMinutes(token.estimatedWaitingTime)}
                      </div>
                      <div className="text-xs capitalize text-slate-500">
                        {token.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-white/12 bg-white/3 px-4 py-6 text-center text-sm text-slate-400">
                  No waiting tokens right now.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
