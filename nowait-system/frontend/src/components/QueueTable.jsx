import GlassPanel from "./GlassPanel";
import StatusBadge from "./StatusBadge";
import {
  formatDateTime,
  formatMinutes,
  formatShortDate,
  formatToken,
} from "../utils/formatters";

export default function QueueTable({
  title,
  description,
  tokens,
  emptyMessage,
  showBookedBy = false,
}) {
  return (
    <GlassPanel
      eyebrow="Queue Details"
      title={title}
      description={description}
      className="p-0"
    >
      {tokens.length ? (
        <>
          <div className="grid gap-3 md:hidden">
            {tokens.map((token) => (
              <article
                key={token.id}
                className={`rounded-[1.5rem] border p-4 ${
                  token.isCurrent
                    ? "border-emerald-300/18 bg-emerald-400/8"
                    : "border-white/10 bg-white/3"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Token
                    </div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-white">
                      {formatToken(token.tokenNumber)}
                    </div>
                  </div>

                  <StatusBadge status={token.status} skipped={token.wasSkipped} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {showBookedBy ? (
                    <div className="metric-tile">
                      <div className="card-label">Booked by</div>
                      <div className="mt-2 text-sm font-medium text-white">
                        {token.bookedBy || "Walk-in"}
                      </div>
                    </div>
                  ) : null}

                  <div className="metric-tile">
                    <div className="card-label">Booking day</div>
                    <div className="mt-2 text-sm font-medium text-white">
                      {token.bookingLabel || "Booked"}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {formatShortDate(token.bookingDate)}
                    </div>
                  </div>

                  <div className="metric-tile">
                    <div className="card-label">Position</div>
                    <div className="mt-2 text-sm font-medium text-white">
                      {token.queuePosition || token.position || "-"}
                    </div>
                  </div>

                  <div className="metric-tile">
                    <div className="card-label">ETA</div>
                    <div className="mt-2 text-sm font-medium text-white">
                      {formatMinutes(token.estimatedWaitingTime)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-slate-950/48 px-4 py-3">
                  <div className="card-label">Created</div>
                  <div className="mt-2 text-sm text-slate-300">
                    {formatDateTime(token.createdAt)}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left">
              <thead className="border-b border-white/10 bg-white/4 text-xs uppercase tracking-[0.24em] text-slate-400">
                <tr>
                  <th className="px-6 py-4 sm:px-8">Token</th>
                  {showBookedBy ? <th className="px-6 py-4 sm:px-8">Booked By</th> : null}
                  <th className="px-6 py-4 sm:px-8">Booking Day</th>
                  <th className="px-6 py-4 sm:px-8">Status</th>
                  <th className="px-6 py-4 sm:px-8">Position</th>
                  <th className="px-6 py-4 sm:px-8">ETA</th>
                  <th className="px-6 py-4 sm:px-8">Created</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr
                    key={token.id}
                    className={`border-b border-white/6 text-sm text-slate-200 last:border-b-0 ${
                      token.isCurrent ? "bg-emerald-400/8" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-white sm:px-8">
                      {formatToken(token.tokenNumber)}
                    </td>
                    {showBookedBy ? (
                      <td className="px-6 py-4 sm:px-8">
                        <div className="font-medium text-white">{token.bookedBy}</div>
                      </td>
                    ) : null}
                    <td className="px-6 py-4 sm:px-8">
                      <div className="font-medium text-white">
                        {token.bookingLabel || "Booked"}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {formatShortDate(token.bookingDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 sm:px-8">
                      <StatusBadge status={token.status} skipped={token.wasSkipped} />
                    </td>
                    <td className="px-6 py-4 sm:px-8">
                      {token.queuePosition || token.position || "-"}
                    </td>
                    <td className="px-6 py-4 sm:px-8">
                      {formatMinutes(token.estimatedWaitingTime)}
                    </td>
                    <td className="px-6 py-4 text-slate-400 sm:px-8">
                      {formatDateTime(token.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-6 py-12 text-center text-sm text-slate-400 sm:px-8">
          {emptyMessage}
        </div>
      )}
    </GlassPanel>
  );
}
