import {
  formatDateTime,
  formatLongDate,
  formatMinutes,
  formatToken,
} from "../../utils/formatters";
import { DownloadIcon, TicketIcon } from "./UserIcons";
import Button from "../common/Button";

export default function InvoiceCard({ myToken, onDownloadInvoice, userName }) {
  return (
    <section className="glass-card space-y-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="section-label">Invoice</div>
          <h2 className="heading-md mt-2">Booking summary and invoice</h2>
          <p className="text-muted mt-2">
            Download your booking PDF whenever you need it.
          </p>
        </div>

        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-violet-300">
          <DownloadIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="rounded-lg border border-white/8 bg-slate-950/40 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="surface-card">
            <div className="card-label">Booked for</div>
            <div className="mt-1 text-base font-semibold text-white">{userName}</div>
            <div className="mt-1 text-xs text-slate-500">
              Token {formatToken(myToken?.tokenNumber)}
            </div>
          </div>

          <div className="surface-card">
            <div className="card-label">Booking day</div>
            <div className="mt-1 text-base font-semibold text-white">
              {myToken?.bookingLabel || "Booked"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {formatLongDate(myToken?.bookingDate)}
            </div>
          </div>

          <div className="surface-card">
            <div className="card-label">Status</div>
            <div className="mt-1 text-base font-semibold text-white">
              {myToken?.wasSkipped ? "Skipped" : myToken?.status}
            </div>
          </div>

          <div className="surface-card">
            <div className="card-label">Estimated wait</div>
            <div className="mt-1 text-base font-semibold text-white">
              {myToken?.status === "waiting"
                ? formatMinutes(myToken?.estimatedWaitingTime)
                : myToken?.status === "serving"
                  ? "Now"
                  : "Done"}
            </div>
          </div>

          <div className="surface-card sm:col-span-2">
            <div className="card-label">Booked at</div>
            <div className="mt-1 text-base font-semibold text-white">
              {formatDateTime(myToken?.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sky-300">
            <TicketIcon className="h-4 w-4" />
          </div>
          <span>Includes token, queue day, status, and booking details.</span>
        </div>

        <Button
          type="button"
          onClick={onDownloadInvoice}
          variant="primary"
          className="gap-2"
        >
          <DownloadIcon className="h-4 w-4" />
          <span>Download PDF</span>
        </Button>
      </div>
    </section>
  );
}
