import {
  formatDateTime,
  formatLongDate,
  formatMinutes,
  formatToken,
} from "../../utils/formatters";
import { DownloadIcon, TicketIcon } from "./UserIcons";

export default function InvoiceCard({ myToken, onDownloadInvoice, userName }) {
  return (
    <section className="user-dashboard-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="user-dashboard-label">Invoice Card</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Booking summary and invoice
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
            Download a clean invoice PDF for your current booking whenever you need
            it.
          </p>
        </div>

        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-violet-100">
          <DownloadIcon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 rounded-[1.7rem] border border-white/10 bg-slate-950/[0.58] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4">
            <div className="user-dashboard-label">Booked for</div>
            <div className="mt-3 text-lg font-semibold text-white">{userName}</div>
            <div className="mt-2 text-sm text-slate-400">
              Token {formatToken(myToken?.tokenNumber)}
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4">
            <div className="user-dashboard-label">Booking day</div>
            <div className="mt-3 text-lg font-semibold text-white">
              {myToken?.bookingLabel || "Booked"}
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {formatLongDate(myToken?.bookingDate)}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4">
            <div className="user-dashboard-label">Status</div>
            <div className="mt-3 text-base font-semibold text-white">
              {myToken?.wasSkipped ? "Completed - skipped" : myToken?.status}
            </div>
          </div>
          <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4">
            <div className="user-dashboard-label">Estimated wait</div>
            <div className="mt-3 text-base font-semibold text-white">
              {myToken?.status === "waiting"
                ? formatMinutes(myToken?.estimatedWaitingTime)
                : myToken?.status === "serving"
                  ? "Now"
                  : "Done"}
            </div>
          </div>
          <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4">
            <div className="user-dashboard-label">Booked at</div>
            <div className="mt-3 text-base font-semibold text-white">
              {formatDateTime(myToken?.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sky-100">
            <TicketIcon className="h-5 w-5" />
          </div>
          <span>The invoice includes token, queue day, status, ETA, and booking details.</span>
        </div>

        <button
          type="button"
          className="primary-button h-12 justify-center gap-2 sm:min-w-[220px]"
          onClick={onDownloadInvoice}
        >
          <DownloadIcon className="h-4 w-4" />
          <span>Download Invoice</span>
        </button>
      </div>
    </section>
  );
}
