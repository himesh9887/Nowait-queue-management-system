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
    <section className="glass-card-strong space-y-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="section-label">Your Token</div>
          <h2 className="heading-md mt-2">Your live queue pass</h2>
          <p className="text-muted mt-2">
            This is your active token for the {selectedDayInfo?.label?.toLowerCase() || "selected"} queue. Your position updates in real time.
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
          <span className="text-xs font-medium">{socketConnected ? "Live sync" : "Syncing"}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
          
          <div className="relative flex flex-col items-center text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-300">
              <TicketIcon className="h-6 w-6" />
            </div>
            
            <div className="mt-6 text-5xl font-bold text-white sm:text-6xl">
              {formatToken(myToken?.tokenNumber)}
            </div>
            
            <div className={`mt-4 ${meta.badgeClassName}`}>
              {meta.label}
            </div>
            
            <p className="mt-4 max-w-sm text-sm text-slate-400">
              {meta.message}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="surface-card">
            <div className="card-label">Queue day</div>
            <div className="mt-2 text-lg font-semibold text-white">
              {myToken?.bookingLabel || selectedDayInfo?.label || "Selected"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {formatLongDate(myToken?.bookingDate)}
            </div>
          </div>

          <div className="surface-card">
            <div className="card-label">Booked at</div>
            <div className="mt-2 text-lg font-semibold text-white">
              {formatDateTime(myToken?.createdAt)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Saved for invoice & history
            </div>
          </div>

          <div className="surface-card">
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

          <div className="surface-card flex items-center gap-2">
            <BellIcon className="h-4 w-4 shrink-0 text-violet-300" />
            <div className="text-sm text-slate-300">{meta.label}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
