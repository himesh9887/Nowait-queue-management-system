import {
  formatDateTime,
  formatLongDate,
  formatToken,
} from "../../utils/formatters";
import { HistoryIcon } from "./UserIcons";

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
    <section className="user-dashboard-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="user-dashboard-label">History Card</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Previous tokens
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Review previous bookings, visit dates, and queue outcomes in one clean
            timeline.
          </p>
        </div>

        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-violet-100">
          <HistoryIcon className="h-6 w-6" />
        </div>
      </div>

      {items.length ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {items.slice(0, 6).map((item) => (
            <article
              key={item.id}
              className="rounded-[1.6rem] border border-white/10 bg-slate-950/[0.58] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-2xl font-semibold tracking-tight text-white">
                    {formatToken(item.tokenNumber)}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    {formatLongDate(item.bookingDate)}
                  </div>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusClassName(item)}`}
                >
                  {item.wasSkipped ? "Skipped" : item.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-3">
                  <div className="user-dashboard-label">Booked</div>
                  <div className="mt-2 text-sm font-medium text-white">
                    {formatDateTime(item.createdAt)}
                  </div>
                </div>
                <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-3">
                  <div className="user-dashboard-label">Finished</div>
                  <div className="mt-2 text-sm font-medium text-white">
                    {formatDateTime(item.completedAt || item.updatedAt)}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-300">
                {item.bookingLabel || "Booked"} queue
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="user-empty-state mt-8">
          <div className="text-lg font-semibold text-white">No tokens yet</div>
          <div className="mt-2 max-w-md text-sm leading-7 text-slate-400">
            Your previous bookings will appear here as soon as you start using the
            queue.
          </div>
        </div>
      )}
    </section>
  );
}
