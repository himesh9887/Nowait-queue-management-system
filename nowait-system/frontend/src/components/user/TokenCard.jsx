import {
  formatDateTime,
  formatLongDate,
  formatToken,
} from "../../utils/formatters";
import { BellIcon, TicketIcon } from "./UserIcons";

const statusMeta = {
  waiting: {
    label: "Waiting",
    badgeClassName: "badge badge-info",
    message: "You are in line and your dashboard will keep updating automatically.",
  },
  serving: {
    label: "Serving",
    badgeClassName: "badge badge-warning",
    message: "Head to the service desk now. Your token is currently being served.",
  },
  completed: {
    label: "Completed",
    badgeClassName: "badge badge-success",
    message: "This booking has completed successfully and remains available in your history.",
  },
};

export default function TokenCard({ myToken, selectedDayInfo, socketConnected }) {
  const meta = statusMeta[myToken?.status] || statusMeta.waiting;

  return (
    <section className="user-dashboard-card user-dashboard-card-strong space-y-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="section-label">Active Token</div>
          <h2 className="heading-md mt-2">Your queue pass</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Everything you need for the current booking is shown here in one place.
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
          <span className="text-xs font-medium">{socketConnected ? "Live sync active" : "Syncing again"}</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="user-token-stage">
          <div className="user-token-stage-glow" />

          <div className="relative flex flex-col items-center text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
              <TicketIcon className="h-6 w-6" />
            </div>

            <div className="mt-6 break-words text-[clamp(2.8rem,15vw,4.5rem)] font-bold tracking-tight text-white sm:text-6xl">
              {formatToken(myToken?.tokenNumber)}
            </div>

            <div className={`mt-4 ${meta.badgeClassName}`}>
              {meta.label}
            </div>

            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">
              {meta.message}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="user-metric-tile">
            <div className="card-label">Queue day</div>
            <div className="mt-2 text-lg font-semibold text-white">
              {myToken?.bookingLabel || selectedDayInfo?.label || "Selected"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {formatLongDate(myToken?.bookingDate)}
            </div>
          </div>

          <div className="user-metric-tile">
            <div className="card-label">Booked at</div>
            <div className="mt-2 text-lg font-semibold text-white">
              {formatDateTime(myToken?.createdAt)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Saved for invoice and history
            </div>
          </div>

          <div className="user-metric-tile">
            <div className="card-label">Queue position</div>
            <div className="mt-2 text-lg font-semibold text-white">
              {myToken?.status === "serving"
                ? "Now"
                : myToken?.queuePosition
                  ? `#${myToken.queuePosition}`
                  : "Done"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Updates as desk moves forward
            </div>
          </div>

          <div className="user-metric-tile">
            <div className="flex items-center gap-2">
              <BellIcon className="h-4 w-4 shrink-0 text-violet-300" />
              <div className="text-sm font-semibold text-white">Current status</div>
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-300">{meta.message}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
