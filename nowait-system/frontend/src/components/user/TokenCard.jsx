import { formatDateTime, formatLongDate, formatToken } from "../../utils/formatters";
import { DownloadIcon, TicketIcon } from "./UserIcons";

const statusStyles = {
  waiting: "border-sky-300/20 bg-sky-400/10 text-sky-100",
  serving: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  completed: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
};

export default function TokenCard({
  myToken,
  socketConnected,
  onDownloadInvoice,
}) {
  const isActive = myToken && ["waiting", "serving"].includes(myToken.status);

  return (
    <section
      className={`user-dashboard-card ${isActive ? "user-dashboard-card-strong" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="user-dashboard-label">My Token</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {myToken ? "Your live queue pass" : "No active token yet"}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
            {myToken
              ? "Your number, queue date, and live status stay synced automatically while the service desk moves."
              : "Book a token to start tracking your date-based queue position, estimated wait, and downloadable invoice."}
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
          <span>{socketConnected ? "Live sync" : "Reconnecting"}</span>
        </div>
      </div>

      {myToken ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.95fr]">
          <div className="user-token-stage">
            <div className="user-token-stage-glow" />
            <div className="relative">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-sky-100">
                <TicketIcon className="h-6 w-6" />
              </div>
              <div className="mt-5 text-[5rem] font-semibold leading-none tracking-tight text-white sm:text-[5.75rem]">
                {formatToken(myToken.tokenNumber)}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <div
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${
                    statusStyles[myToken.status] ||
                    "border-white/10 bg-white/[0.06] text-slate-100"
                  }`}
                >
                  {myToken.status}
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200">
                  {myToken.bookingLabel} queue
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="user-metric-tile">
              <div className="user-dashboard-label">Booked at</div>
              <div className="mt-3 text-xl font-semibold text-white">
                {formatDateTime(myToken.createdAt)}
              </div>
            </div>
            <div className="user-metric-tile">
              <div className="user-dashboard-label">Booking date</div>
              <div className="mt-3 text-xl font-semibold text-white">
                {formatLongDate(myToken.bookingDate)}
              </div>
            </div>
            <div className="user-metric-tile">
              <div className="user-dashboard-label">Queue position</div>
              <div className="mt-3 text-xl font-semibold text-white">
                {myToken.queuePosition ? `#${myToken.queuePosition}` : "Active"}
              </div>
            </div>
            <div className="user-metric-tile">
              <div className="user-dashboard-label">Invoice</div>
              <button
                type="button"
                className="secondary-button mt-3 h-11 w-full justify-center gap-2"
                onClick={onDownloadInvoice}
              >
                <DownloadIcon className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
            </div>
            <div className="user-metric-tile sm:col-span-2">
              <div className="user-dashboard-label">Status note</div>
              <div className="mt-3 text-base font-medium text-white">
                {myToken.status === "waiting"
                  ? "You are in the queue. Your invoice is ready and the ETA will keep updating live."
                  : myToken.status === "serving"
                    ? "Head to the service desk now. It is your turn."
                    : "This token has been completed. You can still download the invoice for your records."}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="user-empty-state mt-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sky-100">
            <TicketIcon className="h-7 w-7" />
          </div>
          <div className="mt-5 text-lg font-semibold text-white">
            Your next token will appear here
          </div>
          <div className="mt-2 max-w-md text-sm leading-7 text-slate-400">
            Once booked, you will see the token number, booking day, invoice download, and live status changes without refreshing the page.
          </div>
        </div>
      )}
    </section>
  );
}
