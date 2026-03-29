import GlassPanel from "./GlassPanel";
import StatusBadge from "./StatusBadge";
import { formatDateTime, formatMinutes, formatToken } from "../utils/formatters";

export default function QueueTable({
  title,
  description,
  tokens,
  emptyMessage,
}) {
  return (
    <GlassPanel
      eyebrow="Queue Details"
      title={title}
      description={description}
      className="p-0"
    >
      {tokens.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.24em] text-slate-400">
              <tr>
                <th className="px-6 py-4 sm:px-8">Token</th>
                <th className="px-6 py-4 sm:px-8">Service</th>
                <th className="px-6 py-4 sm:px-8">Slot</th>
                <th className="px-6 py-4 sm:px-8">Status</th>
                <th className="px-6 py-4 sm:px-8">Ahead</th>
                <th className="px-6 py-4 sm:px-8">ETA</th>
                <th className="px-6 py-4 sm:px-8">Created</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr
                  key={token.id}
                  className="border-b border-white/[0.06] text-sm text-slate-200 last:border-b-0"
                >
                  <td className="px-6 py-4 font-semibold text-white sm:px-8">
                    {formatToken(token.tokenNumber)}
                  </td>
                  <td className="px-6 py-4 sm:px-8">
                    <div className="font-medium text-white">{token.serviceName}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {token.serviceType}
                    </div>
                  </td>
                  <td className="px-6 py-4 sm:px-8">{token.timeSlot || "Instant"}</td>
                  <td className="px-6 py-4 sm:px-8">
                    <StatusBadge status={token.status} skipped={token.wasSkipped} />
                  </td>
                  <td className="px-6 py-4 sm:px-8">{token.tokensAhead}</td>
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
      ) : (
        <div className="px-6 py-12 text-center text-sm text-slate-400 sm:px-8">
          {emptyMessage}
        </div>
      )}
    </GlassPanel>
  );
}
