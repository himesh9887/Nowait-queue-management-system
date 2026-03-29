export function formatMinutes(minutes) {
  if (!minutes) {
    return "Up next";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function formatToken(tokenNumber) {
  if (!tokenNumber) {
    return "---";
  }

  return String(tokenNumber).padStart(3, "0");
}

export function formatDateTime(date) {
  if (!date) {
    return "--";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}
