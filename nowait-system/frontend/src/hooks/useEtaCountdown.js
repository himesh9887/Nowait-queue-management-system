import { useEffect, useMemo, useState } from "react";

function resolveRemainingMs(estimatedMinutes, referenceTime, now) {
  const totalMs = Math.max(Math.round((estimatedMinutes || 0) * 60_000), 0);

  if (!totalMs) {
    return 0;
  }

  const referenceTimestamp = referenceTime ? new Date(referenceTime).getTime() : NaN;
  const elapsedMs = Number.isFinite(referenceTimestamp)
    ? Math.max(now - referenceTimestamp, 0)
    : 0;

  return Math.max(totalMs - elapsedMs, 0);
}

export function useEtaCountdown({
  active = true,
  estimatedMinutes = 0,
  referenceTime = null,
}) {
  const [now, setNow] = useState(() => Date.now());

  const totalMs = useMemo(
    () => Math.max(Math.round((estimatedMinutes || 0) * 60_000), 0),
    [estimatedMinutes],
  );
  const remainingMs = active
    ? resolveRemainingMs(estimatedMinutes, referenceTime, now)
    : 0;

  useEffect(() => {
    if (!active || totalMs <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [active, totalMs, referenceTime]);

  return {
    remainingMs,
    totalMs,
  };
}
