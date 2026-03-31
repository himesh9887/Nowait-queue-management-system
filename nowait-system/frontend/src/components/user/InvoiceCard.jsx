import {
  formatDateTime,
  formatLongDate,
  formatMinutes,
  formatToken,
} from "../../utils/formatters";
import Button from "../common/Button";
import { DownloadIcon, TicketIcon } from "./UserIcons";

export default function InvoiceCard({ myToken, onDownloadInvoice, userName }) {
  return (
    <section className="user-dashboard-card space-y-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="section-label">Invoice</div>
          <h2 className="heading-md mt-2">Receipt and booking details</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Download a clean PDF summary of this booking whenever you need a receipt.
          </p>
        </div>

        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-violet-300">
          <DownloadIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/62 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="user-metric-tile">
            <div className="card-label">Booked for</div>
            <div className="mt-1 text-base font-semibold text-white">{userName}</div>
            <div className="mt-1 text-xs text-slate-500">
              Token {formatToken(myToken?.tokenNumber)}
            </div>
          </div>

          <div className="user-metric-tile">
            <div className="card-label">Booking day</div>
            <div className="mt-1 text-base font-semibold text-white">
              {myToken?.bookingLabel || "Booked"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {formatLongDate(myToken?.bookingDate)}
            </div>
          </div>

          <div className="user-metric-tile">
            <div className="card-label">Status</div>
            <div className="mt-1 text-base font-semibold text-white">
              {myToken?.wasSkipped ? "Skipped" : myToken?.status}
            </div>
          </div>

          <div className="user-metric-tile">
            <div className="card-label">Estimated wait</div>
            <div className="mt-1 text-base font-semibold text-white">
              {myToken?.status === "waiting"
                ? formatMinutes(myToken?.estimatedWaitingTime)
                : myToken?.status === "serving"
                  ? "Now"
                  : "Done"}
            </div>
          </div>

          <div className="user-metric-tile sm:col-span-2">
            <div className="card-label">Booked at</div>
            <div className="mt-1 text-base font-semibold text-white">
              {formatDateTime(myToken?.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sky-300">
            <TicketIcon className="h-4 w-4" />
          </div>
          <span>Includes token number, queue day, status, and booking timestamp.</span>
        </div>

        <Button
          type="button"
          onClick={onDownloadInvoice}
          variant="primary"
          className="w-full justify-center sm:w-auto"
        >
          <DownloadIcon className="h-4 w-4" />
          <span>Download PDF</span>
        </Button>
      </div>
    </section>
  );
}
