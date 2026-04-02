import {
  formatDateTime,
  formatLongDate,
  formatToken,
} from "../../utils/formatters";
import { TicketIcon } from "./UserIcons";

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
    <section className="user-dashboard-card space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="section-label">Active Token</div>
          <h2 className="heading-md mt-2">Token details</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Your current booking information is shown here in one place.
          </p>
        </div>

        <div className={meta.badgeClassName}>{meta.label}</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="user-simple-panel text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
            <TicketIcon className="h-6 w-6" />
          </div>
          <div className="card-label mt-4">Token number</div>
          <div className="mt-3 break-words text-[clamp(2.6rem,14vw,4.25rem)] font-bold tracking-tight text-white">
            {formatToken(myToken?.tokenNumber)}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{meta.message}</p>
        </div>

        <div className="user-simple-panel">
          <div className="user-key-value-list">
            <div className="user-key-value-row">
              <span className="user-dashboard-label">Queue day</span>
              <span className="user-key-value-value">
                {myToken?.bookingLabel || selectedDayInfo?.label || "Selected"}
              </span>
            </div>
            <div className="user-key-value-row">
              <span className="user-dashboard-label">Booking date</span>
              <span className="user-key-value-value">
                {formatLongDate(myToken?.bookingDate)}
              </span>
            </div>
            <div className="user-key-value-row">
              <span className="user-dashboard-label">Booked at</span>
              <span className="user-key-value-value">
                {formatDateTime(myToken?.createdAt)}
              </span>
            </div>
            <div className="user-key-value-row">
              <span className="user-dashboard-label">Queue position</span>
              <span className="user-key-value-value">
                {myToken?.status === "serving"
                  ? "Now"
                  : myToken?.queuePosition
                    ? `#${myToken.queuePosition}`
                    : "Done"}
              </span>
            </div>
            <div className="user-key-value-row">
              <span className="user-dashboard-label">Live sync</span>
              <span className="user-key-value-value">
                {socketConnected ? "Connected" : "Reconnecting"}
              </span>
            </div>
            <div className="user-key-value-row">
              <span className="user-dashboard-label">Status note</span>
              <span className="user-key-value-value">{meta.message}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
