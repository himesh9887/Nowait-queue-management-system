import GlassPanel from "./GlassPanel";
import StatCard from "./StatCard";
import { formatToken } from "../utils/formatters";

export default function HeroBanner({ stats, currentServing, socketConnected }) {
  return (
    <GlassPanel className="animated-border overflow-hidden p-0">
      <div className="grid gap-8 px-6 py-6 sm:px-8 sm:py-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/[0.6] p-6 sm:p-8">
          <div className="section-label">NoWait Live Queue</div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Real-time booking, smarter queue movement, and zero guessing on wait time.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
            Book a token ahead of time, follow the queue as it moves, and know exactly how many people are ahead before you even arrive.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-200">
              {socketConnected ? "Live socket connected" : "Live socket reconnecting"}
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              Avg service time {stats.avgServiceTime} min
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="glass-card-strong float-slow relative p-6 sm:p-8">
            <div className="section-label">Currently Serving</div>
            <div className="mt-4 text-6xl font-semibold tracking-tight text-white sm:text-7xl">
              {formatToken(currentServing?.tokenNumber)}
            </div>
            <div className="mt-3 text-sm uppercase tracking-[0.2em] text-slate-400">
              {currentServing?.serviceName || "Waiting for first call"}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Active queue"
              value={stats.activeQueue}
              description="Waiting and serving tokens"
            />
            <StatCard
              label="Completed today"
              value={stats.completedTokens}
              description="Finished or skipped tokens"
            />
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
