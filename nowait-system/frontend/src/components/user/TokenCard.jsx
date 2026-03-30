import {
  formatDateTime,
  formatLongDate,
  formatToken,
} from "../../utils/formatters";
import { BellIcon, TicketIcon } from "./UserIcons";

const statusMeta = {
  waiting: {
    label: "Waiting",
    badgeClassName: "border-sky-300/20 bg-sky-400/10 text-sky-100",
    message: "You are in line and your dashboard will keep updating automatically.",
  },
  serving: {
    label: "Serving",
    badgeClassName: "border-amber-300/20 bg-amber-400/10 text-amber-100",
    message: "Head to the service desk now. Your token is currently being served.",
  },
  completed: {
    label: "Completed",
    badgeClassName: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    message: "This booking has completed successfully and remains available in your history.",
  },
};

export default function TokenCard({ myToken, selectedDayInfo, socketConnected }) {
  const meta = statusMeta[myToken?.status] || statusMeta.waiting;

  return (
    <section className="user-dashboard-card user-dashboard-card-strong">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="user-dashboard-label">Token Card</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Your live queue pass
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
            This is your active token for the {selectedDayInfo?.label?.toLowerCase() || "selected"} queue, kept in sync with real-time desk updates.
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
          <span>{socketConnected ? "Realtime token sync" : "Syncing token"}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="user-token-stage">
          <div className="user-token-stage-glow" />
          <div className="relative flex flex-col items-center text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-sky-100">
              <TicketIcon className="h-7 w-7" />
            </div>
            <div className="mt-6 text-[4.9rem] font-semibold leading-none tracking-tight text-white sm:text-[5.8rem]">
              {formatToken(myToken?.tokenNumber)}
            </div>
            <div
              className={`mt-5 rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] ${meta.badgeClassName}`}
            >
              {meta.label}
            </div>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              {meta.message}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div className="user-metric-tile">
            <div className="user-dashboard-label">Queue day</div>
            <div className="mt-3 text-xl font-semibold text-white">
              {myToken?.bookingLabel || selectedDayInfo?.label || "Selected"}
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {formatLongDate(myToken?.bookingDate)}
            </div>
          </div>

          <div className="user-metric-tile">
            <div className="user-dashboard-label">Booked at</div>
            <div className="mt-3 text-xl font-semibold text-white">
              {formatDateTime(myToken?.createdAt)}
            </div>
            <div className="mt-2 text-sm text-slate-400">
              Your booking time is saved for invoice and history.
            </div>
          </div>

          <div className="user-metric-tile">
            <div className="user-dashboard-label">Queue position</div>
            <div className="mt-3 text-xl font-semibold text-white">
              {myToken?.status === "serving"
                ? "Now"
                : myToken?.queuePosition
                  ? `#${myToken.queuePosition}`
                  : "Done"}
            </div>
            <div className="mt-2 text-sm text-slate-400">
              Position updates as the desk moves through the queue.
            </div>
          </div>

          <div className="user-metric-tile">
            <div className="flex items-center gap-2 text-slate-300">
              <BellIcon className="h-4 w-4 text-violet-200" />
              <span className="user-dashboard-label text-slate-300">Status note</span>
            </div>
            <div className="mt-3 text-sm leading-7 text-slate-300">
              {meta.message}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
