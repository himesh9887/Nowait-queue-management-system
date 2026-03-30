const { DEFAULT_AVG_SERVICE_TIME, TOKEN_STATUSES } = require("../config/constants");
const Token = require("../models/Token");
const { getTrackedBookingDays, resolveBookingDay } = require("./bookingDay");

function normalizeId(id) {
  if (!id) {
    return null;
  }

  return typeof id === "string" ? id : id.toString();
}

function sortActiveQueue(first, second) {
  const priority = {
    [TOKEN_STATUSES.SERVING]: 0,
    [TOKEN_STATUSES.WAITING]: 1,
  };

  return (
    (priority[first.status] ?? 2) - (priority[second.status] ?? 2) ||
    first.tokenNumber - second.tokenNumber
  );
}

function sanitizeActiveQueue(tokens) {
  return tokens
    .filter((token) =>
      [TOKEN_STATUSES.WAITING, TOKEN_STATUSES.SERVING].includes(token.status),
    )
    .sort(sortActiveQueue);
}

function getFallbackBookingMeta(token) {
  const bookingDate = new Date(token.bookingDate || token.createdAt || new Date());

  return {
    label: "Booked",
    relativeLabel: null,
    displayDate: new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
    }).format(bookingDate),
  };
}

function toTokenShape(token, index, dayMeta, avgServiceTime) {
  const isWaiting = token.status === TOKEN_STATUSES.WAITING;
  const isServing = token.status === TOKEN_STATUSES.SERVING;
  const tokensAhead = isWaiting ? index : 0;
  const estimatedWaitingTime = isWaiting ? tokensAhead * avgServiceTime : 0;

  return {
    id: normalizeId(token._id || token.id),
    userId: normalizeId(token.userId),
    bookedBy: token.userDisplayName,
    tokenNumber: token.tokenNumber,
    status: token.status,
    estimatedTime: isWaiting ? token.estimatedTime ?? estimatedWaitingTime : 0,
    estimatedWaitingTime,
    tokensAhead,
    isCurrent: isServing,
    wasSkipped: Boolean(token.wasSkipped),
    createdAt: token.createdAt,
    updatedAt: token.updatedAt,
    calledAt: token.calledAt,
    completedAt: token.completedAt,
    position: isServing || isWaiting ? index + 1 : null,
    queuePosition: isServing || isWaiting ? index + 1 : null,
    bookingDate: token.bookingDate,
    bookingDayKey: token.bookingDayKey,
    bookingLabel: dayMeta.label,
    bookingRelativeLabel: dayMeta.relativeLabel,
    bookingDisplayDate: dayMeta.displayDate,
  };
}

function buildDaySnapshot(dayMeta, tokens) {
  const avgServiceTime = DEFAULT_AVG_SERVICE_TIME;
  const activeDocs = sanitizeActiveQueue(tokens);
  const queue = activeDocs.map((token, index) =>
    toTokenShape(token, index, dayMeta, avgServiceTime),
  );
  const completedQueue = tokens
    .filter((token) => token.status === TOKEN_STATUSES.COMPLETED)
    .sort((first, second) => second.tokenNumber - first.tokenNumber)
    .map((token) => ({
      ...toTokenShape(token, -1, dayMeta, avgServiceTime),
      estimatedTime: 0,
      estimatedWaitingTime: 0,
      tokensAhead: 0,
      isCurrent: false,
      position: null,
      queuePosition: null,
    }));
  const currentServing =
    queue.find((token) => token.status === TOKEN_STATUSES.SERVING) || null;
  const nextUp =
    queue.find((token) => token.status === TOKEN_STATUSES.WAITING) || null;

  return {
    day: dayMeta,
    stats: {
      totalTokens: tokens.length,
      activeQueue: queue.length,
      completedTokens: completedQueue.length,
      waitingTokens: queue.filter(
        (token) => token.status === TOKEN_STATUSES.WAITING,
      ).length,
      avgServiceTime,
      queueForecast:
        queue.filter((token) => token.status === TOKEN_STATUSES.WAITING).length *
        avgServiceTime,
    },
    currentServing,
    nextUp,
    queue,
    completedQueue: completedQueue.slice(0, 12),
  };
}

function createTokenSnapshot(token, snapshot) {
  if (!token) {
    return null;
  }

  const activeQueue = snapshot?.queue || [];
  const tokenId = normalizeId(token._id || token.id);
  const activeIndex = activeQueue.findIndex((queueToken) => queueToken.id === tokenId);
  const bookingMeta =
    snapshot?.selectedDay?.key === token.bookingDayKey
      ? snapshot.selectedDay
      : resolveBookingDay(token.bookingDayKey) || getFallbackBookingMeta(token);
  const isWaiting = token.status === TOKEN_STATUSES.WAITING;
  const isServing = token.status === TOKEN_STATUSES.SERVING;
  const tokensAhead = isWaiting && activeIndex >= 0 ? activeIndex : 0;
  const estimatedWaitingTime = isWaiting
    ? tokensAhead * (snapshot?.stats?.avgServiceTime || DEFAULT_AVG_SERVICE_TIME)
    : 0;

  return {
    id: tokenId,
    userId: normalizeId(token.userId),
    bookedBy: token.userDisplayName,
    tokenNumber: token.tokenNumber,
    status: token.status,
    estimatedTime: isWaiting ? token.estimatedTime ?? estimatedWaitingTime : 0,
    estimatedWaitingTime,
    tokensAhead,
    isCurrent: isServing,
    wasSkipped: Boolean(token.wasSkipped),
    createdAt: token.createdAt,
    updatedAt: token.updatedAt,
    calledAt: token.calledAt,
    completedAt: token.completedAt,
    position: activeIndex >= 0 ? activeIndex + 1 : null,
    queuePosition: activeIndex >= 0 ? activeIndex + 1 : null,
    bookingDate: token.bookingDate,
    bookingDayKey: token.bookingDayKey,
    bookingLabel: bookingMeta?.label || "Booked",
    bookingRelativeLabel: bookingMeta?.relativeLabel || null,
    bookingDisplayDate: bookingMeta?.displayDate || null,
  };
}

async function syncQueueEstimates(dayKey = null) {
  const filter = {
    status: {
      $in: [TOKEN_STATUSES.WAITING, TOKEN_STATUSES.SERVING],
    },
  };

  if (dayKey) {
    filter.bookingDayKey = dayKey;
  }

  const activeDocs = await Token.find(filter).sort({ bookingDayKey: 1, tokenNumber: 1 });
  const groupedByDay = activeDocs.reduce((groups, token) => {
    const key = token.bookingDayKey;

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(token);
    return groups;
  }, new Map());
  const operations = [];

  groupedByDay.forEach((tokens) => {
    const activeQueue = sanitizeActiveQueue(tokens);

    activeQueue.forEach((token, index) => {
      const estimatedTime =
        token.status === TOKEN_STATUSES.WAITING
          ? index * DEFAULT_AVG_SERVICE_TIME
          : 0;

      if (token.estimatedTime !== estimatedTime) {
        operations.push({
          updateOne: {
            filter: { _id: token._id },
            update: { $set: { estimatedTime } },
          },
        });
      }
    });
  });

  if (operations.length) {
    await Token.bulkWrite(operations);
  }

  return {
    avgServiceTime: DEFAULT_AVG_SERVICE_TIME,
  };
}

function pickTargetToken(tokens, tokenId, userId) {
  if (tokenId) {
    return tokens.find((token) => normalizeId(token._id) === tokenId) || null;
  }

  if (!userId) {
    return null;
  }

  return (
    tokens
      .filter((token) => normalizeId(token.userId) === userId)
      .sort((first, second) => {
        const firstRank = first.status === TOKEN_STATUSES.COMPLETED ? 1 : 0;
        const secondRank = second.status === TOKEN_STATUSES.COMPLETED ? 1 : 0;

        return firstRank - secondRank || second.tokenNumber - first.tokenNumber;
      })[0] || null
  );
}

async function buildQueueSnapshot(options = {}) {
  const { tokenId = null, userId = null, day = "today" } =
    typeof options === "string"
      ? { tokenId: options, userId: null, day: "today" }
      : options;
  const selectedDay = resolveBookingDay(day) || resolveBookingDay("today");
  const trackedDays = getTrackedBookingDays();
  const trackedKeys = trackedDays.map((item) => item.key);
  const trackedDocs = await Token.find({
    bookingDayKey: { $in: trackedKeys },
  })
    .sort({ bookingDayKey: 1, tokenNumber: 1 })
    .lean();
  const selectedDayDocs = trackedDocs.filter(
    (token) => token.bookingDayKey === selectedDay.key,
  );
  const selectedDaySnapshot = buildDaySnapshot(selectedDay, selectedDayDocs);
  const daySummaries = trackedDays.map((dayMeta) => {
    const tokens = trackedDocs.filter((token) => token.bookingDayKey === dayMeta.key);
    const daySnapshot = buildDaySnapshot(dayMeta, tokens);

    return {
      ...dayMeta,
      ...daySnapshot.stats,
      currentServingToken: daySnapshot.currentServing?.tokenNumber || null,
      nextUpToken: daySnapshot.nextUp?.tokenNumber || null,
    };
  });
  const todaySummary =
    daySummaries.find((item) => item.relativeLabel === "today") || null;
  const tomorrowSummary =
    daySummaries.find((item) => item.relativeLabel === "tomorrow") || null;
  const userDocs = userId
    ? await Token.find({ userId }).sort({ createdAt: -1, tokenNumber: -1 }).lean()
    : [];
  const targetToken = pickTargetToken(selectedDayDocs, tokenId, userId);

  const snapshot = {
    stats: {
      ...selectedDaySnapshot.stats,
      dayTokens: selectedDaySnapshot.stats.totalTokens,
      todayTokens: todaySummary?.totalTokens || 0,
      tomorrowTokens: tomorrowSummary?.totalTokens || 0,
      totalTrackedTokens:
        (todaySummary?.totalTokens || 0) + (tomorrowSummary?.totalTokens || 0),
    },
    selectedDay,
    days: daySummaries,
    currentServing: selectedDaySnapshot.currentServing,
    nextUp: selectedDaySnapshot.nextUp,
    queue: selectedDaySnapshot.queue,
    completedQueue: selectedDaySnapshot.completedQueue,
    services: [],
    generatedAt: new Date().toISOString(),
  };

  if (targetToken) {
    snapshot.myToken = createTokenSnapshot(targetToken, snapshot);
  }

  if (userId) {
    snapshot.userHistory = userDocs
      .slice(0, 12)
      .map((token) => createTokenSnapshot(token, snapshot));
  }

  return snapshot;
}

module.exports = {
  buildQueueSnapshot,
  createTokenSnapshot,
  sortActiveQueue,
  syncQueueEstimates,
};
