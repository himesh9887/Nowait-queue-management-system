import GlassPanel from "./GlassPanel";
import { formatMinutes, formatToken } from "../utils/formatters";

export default function LiveBoard({
  currentServing,
  nextUp,
  stats,
  selectedDayInfo,
}) {
  return (
    <GlassPanel
      eyebrow="Queue Pulse"
      title={`${selectedDayInfo?.label || "Today"} live board`}
      description="The serving desk and upcoming callers update instantly as the admin advances the queue."
      className="p-0"
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card-strong pulse-ring px-6 py-8 text-center sm:px-8">
          <div className="text-sm uppercase tracking-[0.32em] text-cyan-200/80">
            Now serving
          </div>
          <div className="mt-6 text-7xl font-semibold tracking-tight text-white sm:text-8xl">
            {formatToken(currentServing?.tokenNumber)}
          </div>
          <div className="mt-4 text-base text-slate-300">
            {selectedDayInfo?.label || "Selected"} queue
          </div>
        </div>

        <div className="grid gap-4">
          <div className="metric-tile">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Next up
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">
              {formatToken(nextUp?.tokenNumber)}
            </div>
            <div className="mt-2 text-sm text-slate-300">
              {nextUp ? `Queue position #${nextUp.queuePosition || nextUp.position}` : "No waiting tokens"}
            </div>
          </div>

          <div className="metric-tile">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Queue forecast
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">
              {formatMinutes(stats.waitingTokens * stats.avgServiceTime)}
            </div>
            <div className="mt-2 text-sm text-slate-300">
              Approximate wait for the newest booking
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
