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
    <section className="glass-card space-y-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="section-label">Live Queue</div>
          <h2 className="heading-md mt-2">Queue status in real time</h2>
          <p className="text-muted mt-2">
            Watch the desk activity and upcoming tokens without refreshing the page.
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
          <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
          
          <div className="relative">
            <div className="text-sm text-slate-400 mb-2">Now serving</div>
            <div className="text-5xl font-bold text-white sm:text-6xl">
              {formatToken(currentServing?.tokenNumber)}
            </div>
            <div className="mt-4 text-slate-300">
              In the {selectedDayInfo?.label?.toLowerCase() || "selected"} queue
            </div>
            <div className="mt-4 text-xs text-slate-400">
              ✓ Updated {formatDateTime(generatedAt)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="surface-card">
              <div className="card-label">Active queue</div>
              <div className="mt-2 text-2xl font-bold text-white">{queue.length}</div>
              <div className="mt-1 text-xs text-slate-500">tokens</div>
            </div>
            <div className="surface-card">
              <div className="card-label">Queue flow</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {upcomingTokens.length ? "Moving" : "Quiet"}
              </div>
              <div className="mt-1 text-xs text-slate-500">status</div>
            </div>
          </div>

          <div className="rounded-lg border border-white/8 bg-slate-950/40 p-4">
            <div className="mb-3 text-sm font-semibold text-white">Upcoming tokens</div>

            <div className="space-y-2">
              {upcomingTokens.length ? (
                upcomingTokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-white/8 bg-slate-900/50 px-3 py-2"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {formatToken(token.tokenNumber)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Position #{token.queuePosition || token.position || "-"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">
                        {formatMinutes(token.estimatedWaitingTime)}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">
                        {token.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-white/10 bg-slate-900/30 px-3 py-4 text-center text-xs text-slate-500">
                  No waiting tokens
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
