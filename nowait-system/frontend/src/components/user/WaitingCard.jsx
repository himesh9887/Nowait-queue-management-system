import { formatMinutes, formatToken } from "../../utils/formatters";
import { TimerIcon } from "./UserIcons";

export default function WaitingCard({ avgServiceTime, currentServing, myToken }) {
  const servingToken = currentServing?.tokenNumber || 0;
  const tokensAhead =
    myToken?.status === "waiting"
      ? Math.max(myToken.tokensAhead ?? myToken.tokenNumber - servingToken, 0)
      : 0;
  const estimatedWait =
    myToken?.status === "waiting"
      ? myToken.estimatedWaitingTime ??
        Math.max(myToken.tokenNumber - servingToken, 0) * avgServiceTime
      : 0;
  const progressValue =
    myToken?.status === "waiting"
      ? Math.max(8, Math.min(100, 100 - tokensAhead * 14))
      : myToken?.status === "serving"
        ? 100
        : 0;
  const queueMessage =
    myToken?.status === "waiting"
      ? `${tokensAhead} ${tokensAhead === 1 ? "person is" : "people are"} ahead of you`
      : myToken?.status === "serving"
        ? "No one is ahead of you right now"
        : "This token is already complete";

  return (
    <section className="user-dashboard-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="user-dashboard-label">Waiting Card</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Live waiting time
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
            Queue position and ETA adjust automatically as tokens are served in
            real time.
          </p>
        </div>

        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-sky-100">
          <TimerIcon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="user-wait-highlight">
          <div className="user-dashboard-label">Tokens ahead</div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {myToken?.status === "waiting" ? tokensAhead : 0}
          </div>
          <div className="mt-2 text-sm leading-7 text-slate-300">{queueMessage}</div>
        </div>

        <div className="user-wait-highlight user-wait-highlight-accent">
          <div className="user-dashboard-label">Estimated waiting time</div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {myToken?.status === "waiting"
              ? formatMinutes(estimatedWait)
              : myToken?.status === "serving"
                ? "Now"
                : "Done"}
          </div>
          <div className="mt-2 text-sm leading-7 text-slate-300">
            Based on token {formatToken(currentServing?.tokenNumber)} being served and
            an average of {avgServiceTime} minutes per token.
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/[0.55] p-4">
        <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
          <span>Queue progress</span>
          <span>
            {myToken?.status === "waiting"
              ? tokensAhead <= 2
                ? "Almost there"
                : "Moving steadily"
              : myToken?.status === "serving"
                ? "It is your turn"
                : "Queue closed"}
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(56,189,248,0.95),rgba(129,140,248,0.95),rgba(168,85,247,0.92))] transition-all duration-500"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>
    </section>
  );
}
