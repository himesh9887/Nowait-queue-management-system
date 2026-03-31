import GlassPanel from "./GlassPanel";
import { formatMinutes, formatToken } from "../utils/formatters";

export default function TokenSummary({
  myToken,
  currentServing,
  onClear,
  socketConnected,
  showClearAction = true,
}) {
  return (
    <GlassPanel
      eyebrow="My Token"
      title={myToken ? "Live token tracking" : "No token booked yet"}
      description={
        myToken
          ? "Your queue position updates automatically as tokens are called."
          : "Book a token to see your position, tokens ahead, and estimated wait."
      }
      className="p-0"
    >
      {myToken ? (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-card-strong flex flex-col justify-between px-6 py-8 sm:px-8">
            <div>
              <div className="section-label">Token Number</div>
              <div className="mt-4 text-7xl font-semibold tracking-tight text-white">
                {formatToken(myToken.tokenNumber)}
              </div>
              <div className="mt-3 text-sm text-slate-300">{myToken.serviceName}</div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-200">
                {myToken.status}
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                {socketConnected ? "Live sync on" : "Reconnecting"}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="metric-tile">
              <div className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Current serving
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">
                {formatToken(currentServing?.tokenNumber)}
              </div>
            </div>
            <div className="metric-tile">
              <div className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Tokens ahead
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">
                {myToken.tokensAhead}
              </div>
            </div>
            <div className="metric-tile">
              <div className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Estimated wait
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">
                {formatMinutes(myToken.estimatedWaitingTime)}
              </div>
            </div>
            <div className="metric-tile">
              <div className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Preferred slot
              </div>
              <div className="mt-3 text-2xl font-semibold text-white">
                {myToken.timeSlot || "Instant"}
              </div>
            </div>
            {showClearAction && onClear ? (
              <button
                type="button"
                className="secondary-button sm:col-span-2"
                onClick={onClear}
              >
                Clear tracked token
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-slate-950/45 px-6 py-12 text-center text-sm text-slate-400 sm:px-8">
          Once you book a token, your live progress card will appear here.
        </div>
      )}
    </GlassPanel>
  );
}
