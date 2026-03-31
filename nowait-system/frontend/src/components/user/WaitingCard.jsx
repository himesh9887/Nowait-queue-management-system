import { useEtaCountdown } from "../../hooks/useEtaCountdown";
import {
  formatCountdown,
  formatMinutes,
  formatToken,
} from "../../utils/formatters";
import { TimerIcon } from "./UserIcons";

export default function WaitingCard({
  avgServiceTime,
  currentServing,
  generatedAt,
  myToken,
}) {
  const servingToken = currentServing?.tokenNumber || 0;
  const queueHasNotStarted = myToken?.status === "waiting" && !currentServing;
  const tokensAhead =
    myToken?.status === "waiting"
      ? Math.max(myToken.tokensAhead ?? myToken.tokenNumber - servingToken, 0)
      : 0;
  const estimatedWait =
    myToken?.status === "waiting"
      ? myToken.estimatedWaitingTime ??
        Math.max(myToken.tokenNumber - servingToken, 0) * avgServiceTime
      : 0;
  const { remainingMs } = useEtaCountdown({
    active: myToken?.status === "waiting" && !queueHasNotStarted,
    estimatedMinutes: estimatedWait,
    referenceTime: generatedAt,
  });
  const progressValue =
    myToken?.status === "waiting"
      ? Math.max(8, Math.min(100, 100 - tokensAhead * 14))
      : myToken?.status === "serving"
        ? 100
        : 0;
  const queueMessage =
    myToken?.status === "waiting"
      ? `${tokensAhead} ${tokensAhead === 1 ? "person is" : "people are"} ahead`
      : myToken?.status === "serving"
        ? "You are now being served"
        : "This booking is complete";
  const etaLabel =
    myToken?.status === "waiting"
      ? queueHasNotStarted
        ? "Pending"
        : formatMinutes(estimatedWait)
      : myToken?.status === "serving"
        ? "Now"
        : "Done";
  const countdownLabel =
    myToken?.status === "waiting"
      ? queueHasNotStarted
        ? "Pending"
        : formatCountdown(remainingMs)
      : myToken?.status === "serving"
        ? "00:00"
        : "--:--";
  const etaSupportCopy = queueHasNotStarted
    ? "Queue has not started yet. ETA will appear when service begins."
    : `Based on token ${formatToken(currentServing?.tokenNumber)} being served.`;
  const countdownSupportCopy =
    myToken?.status === "waiting"
      ? queueHasNotStarted
        ? "Countdown starts when service begins."
        : "Updates every second for truly live ETA."
      : myToken?.status === "serving"
        ? "Head to the desk now."
        : "Session complete.";

  return (
    <section className="user-dashboard-card space-y-6 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="section-label">Wait Tracker</div>
          <h2 className="heading-md mt-2">Live wait estimate</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            See how many people are ahead, how fast the desk is moving, and when your turn should arrive.
          </p>
        </div>

        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-300">
          <TimerIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="user-metric-tile">
          <div className="card-label">Tokens ahead</div>
          <div className="mt-2 text-3xl font-bold text-white">
            {myToken?.status === "waiting" ? tokensAhead : 0}
          </div>
          <div className="mt-2 text-sm text-slate-400">
            {queueMessage}
          </div>
        </div>

        <div className="user-metric-tile">
          <div className="card-label">Estimated wait</div>
          <div className="mt-2 text-3xl font-bold text-white">
            {etaLabel}
          </div>
          <div className="mt-2 text-sm text-slate-400">
            {etaSupportCopy}
          </div>
        </div>

        <div className="user-metric-tile">
          <div className="card-label">Now serving</div>
          <div className="mt-2 text-3xl font-bold text-white">
            {formatToken(currentServing?.tokenNumber)}
          </div>
          <div className="mt-2 text-sm text-slate-400">
            Current desk token
          </div>
        </div>

        <div className="user-metric-tile">
          <div className="card-label">Avg. service time</div>
          <div className="mt-2 text-3xl font-bold text-white">
            {avgServiceTime ? formatMinutes(avgServiceTime) : "--"}
          </div>
          <div className="mt-2 text-sm text-slate-400">
            Typical time per token
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.6rem] border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(8,47,73,0.6),rgba(15,23,42,0.82),rgba(30,41,59,0.8))] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="card-label text-cyan-300">Live countdown</div>
            <div className="mt-2 font-mono text-4xl font-bold text-white sm:text-5xl">
              {countdownLabel}
            </div>
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase text-slate-300">
            {myToken?.status === "waiting"
              ? queueHasNotStarted
                ? "Awaiting start"
                : "Live"
              : myToken?.status === "serving"
                ? "Now"
                : "Done"}
          </div>
        </div>

        <p className="mt-2 text-sm leading-7 text-slate-300">
          {countdownSupportCopy}
        </p>
      </div>

      <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/62 p-4">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-slate-300">Progress</span>
          <span className="text-xs text-slate-500">
            {myToken?.status === "waiting"
              ? queueHasNotStarted
                ? "Pending start"
                : tokensAhead <= 2
                  ? "Almost your turn"
                  : "Moving"
              : myToken?.status === "serving"
                ? "Your turn"
                : "Complete"}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-900">
          <div
            className="h-full rounded-full bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 transition-all"
            style={{ width: `${progressValue}%` }}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
            <div className="card-label">Current state</div>
            <div className="mt-2 text-sm font-semibold text-white">
              {myToken?.status === "waiting"
                ? queueHasNotStarted
                  ? "Queue not started yet"
                  : tokensAhead <= 2
                    ? "Almost your turn"
                    : "Queue is moving"
                : myToken?.status === "serving"
                  ? "Go to the desk"
                  : "Booking finished"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
            <div className="card-label">Helpful note</div>
            <div className="mt-2 text-sm font-semibold text-white">
              {myToken?.status === "waiting"
                ? "Keep this page open for live updates."
                : myToken?.status === "serving"
                  ? "Keep your token visible."
                  : "Invoice remains available below."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
