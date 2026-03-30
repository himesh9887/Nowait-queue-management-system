import {
  formatDateTime,
  formatMinutes,
  formatToken,
} from "../../utils/formatters";
import { QueuePulseIcon, SparkWaveIcon } from "./UserIcons";

export default function QueueCard({
  currentServing,
  generatedAt,
  queue,
  selectedDayInfo,
  socketConnected,
}) {
  const upcomingTokens = queue.filter((token) => token.status !== "serving").slice(0, 3);

  return (
    <section className="user-dashboard-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="user-dashboard-label">Live Queue Card</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Queue status in real time
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
            Watch the desk activity and upcoming tokens without refreshing the page.
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
          <span>{socketConnected ? "Live queue online" : "Queue reconnecting"}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="user-serving-board">
          <div className="flex items-center gap-2 text-sky-200">
            <QueuePulseIcon className="h-5 w-5" />
            <span className="user-dashboard-label text-sky-200/90">Current serving token</span>
          </div>
          <div className="mt-6 text-[4.2rem] font-semibold leading-none tracking-tight text-white sm:text-[5rem]">
            {formatToken(currentServing?.tokenNumber)}
          </div>
          <div className="mt-3 text-base text-slate-300">
            Now serving in the {selectedDayInfo?.label?.toLowerCase() || "selected"} queue
          </div>
          <div className="mt-6 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
            Updated {formatDateTime(generatedAt)}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="user-metric-tile">
              <div className="user-dashboard-label">Active queue</div>
              <div className="mt-3 text-2xl font-semibold text-white">{queue.length}</div>
            </div>
            <div className="user-metric-tile">
              <div className="flex items-center gap-2 text-slate-300">
                <SparkWaveIcon className="h-4 w-4 text-violet-200" />
                <span className="user-dashboard-label text-slate-300">Queue flow</span>
              </div>
              <div className="mt-3 text-2xl font-semibold text-white">
                {upcomingTokens.length ? "Moving" : "Quiet"}
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/[0.55] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium text-white">Upcoming tokens</div>
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Next in line
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
                  No waiting tokens are in line right now.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
