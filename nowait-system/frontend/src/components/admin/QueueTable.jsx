import {
  ClockIcon,
  PulseIcon,
  QueueIcon,
  TicketIcon,
} from "./AdminIcons";
import { formatMinutes, formatToken } from "../../utils/formatters";

function getStatusStyles(token) {
  if (token.isCurrent) {
    return "border-emerald-300/18 bg-emerald-400/12 text-emerald-50";
  }

  return "border-cyan-300/15 bg-cyan-400/10 text-cyan-50";
}

function StatusPill({ token }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusStyles(token)}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          token.isCurrent ? "bg-emerald-300" : "bg-cyan-300"
        }`}
      />
      {token.isCurrent ? "Serving" : "Waiting"}
    </span>
  );
}

export default function QueueTable({ description, title, tokens }) {
  return (
    <section className="admin-panel admin-fade-up">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="admin-kicker">Queue List</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>

        <div className="admin-chip">
          <QueueIcon className="h-4 w-4 text-cyan-200" />
          {tokens.length} active entries
        </div>
      </div>

      {tokens.length ? (
        <>
          <div className="mt-6 grid gap-3 md:hidden">
            {tokens.map((token) => (
              <div
                key={token.id}
                className={`rounded-[1.6rem] border p-4 ${
                  token.isCurrent
                    ? "border-emerald-300/18 bg-emerald-400/[0.08]"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Token
                    </div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-white">
                      {formatToken(token.tokenNumber)}
                    </div>
                  </div>
                  <StatusPill token={token} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="admin-surface">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                      <TicketIcon className="h-4 w-4" />
                      User
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">
                      {token.bookedBy || "Walk-in"}
                    </div>
                  </div>

                  <div className="admin-surface">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                      <ClockIcon className="h-4 w-4" />
                      ETA
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">
                      {formatMinutes(token.estimatedWaitingTime)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="min-w-full text-left">
              <thead className="border-b border-white/10 text-xs uppercase tracking-[0.24em] text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-medium">Token Number</th>
                  <th className="px-4 py-4 font-medium">User Name</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Position</th>
                  <th className="px-4 py-4 font-medium">Estimated Time</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr
                    key={token.id}
                    className={`border-b border-white/[0.06] text-sm text-slate-200 transition last:border-b-0 ${
                      token.isCurrent ? "bg-emerald-400/[0.08]" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                            token.isCurrent
                              ? "border-emerald-300/18 bg-emerald-400/12 text-emerald-100"
                              : "border-white/10 bg-white/[0.04] text-slate-200"
                          }`}
                        >
                          <TicketIcon className="h-4 w-4" />
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {formatToken(token.tokenNumber)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-white">
                      {token.bookedBy || "Walk-in"}
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill token={token} />
                    </td>
                    <td className="px-4 py-4">
                      {token.isCurrent ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-50">
                          <PulseIcon className="h-4 w-4" />
                          Serving now
                        </span>
                      ) : (
                        token.queuePosition || "-"
                      )}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-100">
                      {formatMinutes(token.estimatedWaitingTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-[1.75rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-12 text-center">
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Queue empty
          </div>
          <div className="mt-3 text-lg font-medium text-slate-200">
            No active tokens are waiting in this queue yet.
          </div>
        </div>
      )}
    </section>
  );
}
