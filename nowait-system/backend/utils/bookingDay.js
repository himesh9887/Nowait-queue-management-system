function pad(value) {
  return String(value).padStart(2, "0");
}

function startOfLocalDay(input = new Date()) {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(input, amount) {
  const date = new Date(input);
  date.setDate(date.getDate() + amount);
  return startOfLocalDay(date);
}

function formatDayKey(input) {
  const date = startOfLocalDay(input);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildDayMeta(date, relativeLabel) {
  const bookingDate = startOfLocalDay(date);

  return {
    key: formatDayKey(bookingDate),
    relativeLabel,
    label: relativeLabel === "today" ? "Today" : "Tomorrow",
    displayDate: new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
    }).format(bookingDate),
    fullDate: new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(bookingDate),
    bookingDate,
    isToday: relativeLabel === "today",
    canServe: relativeLabel === "today",
  };
}

function resolveBookingDay(value, baseDate = new Date()) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  const today = startOfLocalDay(baseDate);
  const tomorrow = addDays(today, 1);
  const todayKey = formatDayKey(today);
  const tomorrowKey = formatDayKey(tomorrow);

  if (!normalized || normalized === "today" || normalized === todayKey) {
    return buildDayMeta(today, "today");
  }

  if (normalized === "tomorrow" || normalized === tomorrowKey) {
    return buildDayMeta(tomorrow, "tomorrow");
  }

  return null;
}

function getTrackedBookingDays(baseDate = new Date()) {
  return [
    resolveBookingDay("today", baseDate),
    resolveBookingDay("tomorrow", baseDate),
  ];
}

module.exports = {
  addDays,
  formatDayKey,
  getTrackedBookingDays,
  resolveBookingDay,
  startOfLocalDay,
};
