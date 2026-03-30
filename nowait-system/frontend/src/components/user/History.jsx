import { formatDateTime, formatLongDate, formatToken } from "../../utils/formatters";
import { HistoryIcon } from "./UserIcons";

const statusStyles = {
  waiting: "border-sky-300/20 bg-sky-400/10 text-sky-100",
  serving: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  completed: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
};

export default function History({ userHistory }) {
  const items = userHistory;

  return (
    <section className="user-dashboard-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="user-dashboard-label">Token History</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Previous visits and bookings
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Review your recent tokens, booking dates, and how each visit ended.
          </p>
        </div>

        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-violet-100">
          <HistoryIcon className="h-6 w-6" />
        </div>
      </div>

      {items.length ? (
        <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950/[0.5]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Token</th>
                  <th className="px-5 py-4">Booking Date</th>
                  <th className="px-5 py-4">Booked</th>
                  <th className="px-5 py-4">Completed</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 8).map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/[0.06] text-sm text-slate-200 last:border-b-0"
                  >
                    <td className="px-5 py-4 font-semibold text-white">
                      {formatToken(item.tokenNumber)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">
                        {formatLongDate(item.bookingDate)}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {item.bookingLabel}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {formatDateTime(item.completedAt || item.updatedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusStyles[item.status] ||
                          "border-white/10 bg-white/[0.05] text-slate-100"
                        }`}
                      >
                        {item.wasSkipped ? "completed - skipped" : item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="user-empty-state mt-8">
          <div className="text-lg font-semibold text-white">No tokens yet</div>
          <div className="mt-2 max-w-md text-sm leading-7 text-slate-400">
            Your recent bookings will appear here with booking dates and status as soon as you start using the queue.
          </div>
        </div>
      )}
    </section>
  );
}
