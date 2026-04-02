import {
  formatDateTime,
  formatLongDate,
  formatMinutes,
  formatToken,
} from "../../utils/formatters";
import Button from "../common/Button";
import { DownloadIcon } from "./UserIcons";

export default function InvoiceCard({ myToken, onDownloadInvoice, userName }) {
  return (
    <section className="user-dashboard-card space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="section-label">Invoice</div>
          <h2 className="heading-md mt-2">Receipt and booking details</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Download a clean PDF summary of this booking whenever you need it.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="user-simple-panel">
          <div className="user-key-value-list">
            <div className="user-key-value-row">
              <span className="user-dashboard-label">Booked for</span>
              <span className="user-key-value-value">{userName}</span>
            </div>
            <div className="user-key-value-row">
              <span className="user-dashboard-label">Token</span>
              <span className="user-key-value-value">{formatToken(myToken?.tokenNumber)}</span>
            </div>
            <div className="user-key-value-row">
              <span className="user-dashboard-label">Booking day</span>
              <span className="user-key-value-value">
                {myToken?.bookingLabel || "Booked"} - {formatLongDate(myToken?.bookingDate)}
              </span>
            </div>
            <div className="user-key-value-row">
              <span className="user-dashboard-label">Status</span>
              <span className="user-key-value-value">
                {myToken?.wasSkipped ? "Skipped" : myToken?.status}
              </span>
            </div>
            <div className="user-key-value-row">
              <span className="user-dashboard-label">Estimated wait</span>
              <span className="user-key-value-value">
                {myToken?.status === "waiting"
                  ? formatMinutes(myToken?.estimatedWaitingTime)
                  : myToken?.status === "serving"
                    ? "Now"
                    : "Done"}
              </span>
            </div>
            <div className="user-key-value-row">
              <span className="user-dashboard-label">Booked at</span>
              <span className="user-key-value-value">{formatDateTime(myToken?.createdAt)}</span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={onDownloadInvoice}
          variant="primary"
          className="w-full justify-center lg:min-w-44"
        >
          <DownloadIcon className="h-4 w-4" />
          <span>Download PDF</span>
        </Button>
      </div>
    </section>
  );
}
