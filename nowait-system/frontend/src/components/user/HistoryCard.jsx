import {
  formatDateTime,
  formatLongDate,
  formatToken,
} from "../../utils/formatters";

function getStatusClassName(item) {
  if (item.wasSkipped) {
    return "border-amber-300/20 bg-amber-400/10 text-amber-100";
  }

  if (item.status === "completed") {
    return "border-emerald-300/20 bg-emerald-400/10 text-emerald-100";
  }

  if (item.status === "serving") {
    return "border-violet-300/20 bg-violet-400/10 text-violet-100";
  }

  return "border-sky-300/20 bg-sky-400/10 text-sky-100";
}

export default function HistoryCard({ items }) {
  return (
    <section className="user-dashboard-card space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="section-label">History</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Previous bookings
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Review your recent visits and their final status.
          </p>
        </div>
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.slice(0, 6).map((item) => (
            <article key={item.id} className="user-list-row">
              <div>
                <div className="text-lg font-semibold tracking-tight text-white">
                  {formatToken(item.tokenNumber)}
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  {formatLongDate(item.bookingDate)}
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  {item.bookingLabel || "Booked"} queue
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <span
                  className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusClassName(item)}`}
                >
                  {item.wasSkipped ? "Skipped" : item.status}
                </span>

                <div>
                  <div className="text-sm text-slate-400">Booked</div>
                  <div className="text-sm font-medium text-white">
                    {formatDateTime(item.createdAt)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-400">Finished</div>
                  <div className="text-sm font-medium text-white">
                    {formatDateTime(item.completedAt || item.updatedAt)}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="user-empty-state">
          <div className="text-lg font-semibold text-white">No bookings yet</div>
          <div className="mt-2 max-w-md text-sm leading-7 text-slate-400">
            Your previous visits will appear here after you start using the queue.
          </div>
        </div>
      )}
    </section>
  );
}
