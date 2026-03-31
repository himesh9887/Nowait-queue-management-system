import {
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  QueueIcon,
  ResetIcon,
  SkipIcon,
  TicketIcon,
} from "./AdminIcons";
import { formatMinutes, formatToken } from "../../utils/formatters";

function ActionButton({
  children,
  description,
  disabled,
  icon,
  onClick,
  toneClassName,
}) {
  const IconComponent = icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`admin-action-button flex min-h-31 flex-col items-start justify-between rounded-[1.6rem] border p-4 text-left transition duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${toneClassName}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white">
        <IconComponent className="h-5 w-5" />
      </div>
      <div>
        <div className="text-base font-semibold text-white">{children}</div>
        <div className="mt-2 text-sm leading-6 text-slate-300">{description}</div>
      </div>
    </button>
  );
}

export default function ControlPanel({
  busyAction,
  canServeSelectedDay,
  currentServing,
  nextUp,
  onNext,
  onResetRequest,
  onStartServing,
  onSkip,
  queueForecast,
  selectedDayInfo,
  socketConnected,
}) {
  const canStartServing = Boolean(
    canServeSelectedDay && !busyAction && !currentServing && nextUp,
  );
  const canAdvanceQueue = Boolean(canServeSelectedDay && !busyAction && currentServing);

  return (
    <section className="admin-panel admin-fade-up">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="admin-kicker">Control Panel</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Queue command center
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Keep the service line moving without generating new tokens. These
            controls only advance or clear the existing queue for the selected day.
          </p>
        </div>

        <div className="admin-chip">
          <span
            className={`h-2 w-2 rounded-full ${
              socketConnected ? "bg-emerald-300" : "bg-amber-300"
            }`}
          />
          {socketConnected ? "Live control sync" : "Syncing controls"}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="admin-surface">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            <TicketIcon className="h-4 w-4" />
            Current serving
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {formatToken(currentServing?.tokenNumber)}
          </div>
        </div>

        <div className="admin-surface">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            <QueueIcon className="h-4 w-4" />
            Next up
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {formatToken(nextUp?.tokenNumber)}
          </div>
        </div>

        <div className="admin-surface">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            <ClockIcon className="h-4 w-4" />
            Queue forecast
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {formatMinutes(queueForecast)}
          </div>
        </div>
      </div>

      {!canServeSelectedDay ? (
        <div className="mt-6 rounded-[1.75rem] border border-amber-300/18 bg-amber-400/8 px-5 py-4 text-sm leading-6 text-amber-100">
          {selectedDayInfo?.label || "This queue"} is visible for planning, but
          actions stay locked until that day becomes active.
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 xl:grid-cols-2">
        <ActionButton
          icon={PlayIcon}
          onClick={onStartServing}
          disabled={!canStartServing}
          toneClassName="border-cyan-300/18 bg-cyan-400/[0.1] hover:-translate-y-1 hover:border-cyan-300/24 hover:bg-cyan-400/[0.15]"
          description="Manually begin service by marking the first waiting token as the active serving token."
        >
          {busyAction === "start" ? "Starting service..." : "Start Serving"}
        </ActionButton>

        <ActionButton
          icon={CheckCircleIcon}
          onClick={onNext}
          disabled={!canAdvanceQueue}
          toneClassName="border-emerald-300/18 bg-emerald-400/[0.1] hover:-translate-y-1 hover:border-emerald-300/24 hover:bg-emerald-400/[0.15]"
          description="Move the current token to completed and begin serving the next waiting token."
        >
          {busyAction === "next" ? "Calling next token..." : "Next Token"}
        </ActionButton>

        <ActionButton
          icon={SkipIcon}
          onClick={onSkip}
          disabled={!canAdvanceQueue}
          toneClassName="border-amber-300/18 bg-amber-400/8 hover:-translate-y-1 hover:border-amber-300/24 hover:bg-amber-400/[0.13]"
          description="Mark the active token as skipped, then advance service to the next waiting customer."
        >
          {busyAction === "skip" ? "Skipping token..." : "Skip Token"}
        </ActionButton>

        <ActionButton
          icon={ResetIcon}
          onClick={onResetRequest}
          disabled={Boolean(busyAction)}
          toneClassName="border-rose-300/18 bg-rose-500/[0.08] hover:-translate-y-1 hover:border-rose-300/24 hover:bg-rose-500/[0.14]"
          description="Clear the selected day queue after confirmation and reset the daily token counter."
        >
          {busyAction === "reset" ? "Resetting queue..." : "Reset Queue"}
        </ActionButton>
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-950/62 p-5">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Queue logic
        </div>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-300 sm:grid-cols-3">
          <div className="rounded-[1.35rem] border border-white/8 bg-white/3 p-4">
            Start Serving manually begins the queue and guarantees only one serving
            token at a time.
          </div>
          <div className="rounded-[1.35rem] border border-white/8 bg-white/3 p-4">
            Next token completes the current call before promoting the next waiting
            entry to serving.
          </div>
          <div className="rounded-[1.35rem] border border-white/8 bg-white/3 p-4">
            Skip and reset keep the queue sequential, preserve day separation, and
            never create new tokens from admin.
          </div>
        </div>
      </div>
    </section>
  );
}
