const {
  DEFAULT_AVG_SERVICE_TIME,
  SERVICE_CATALOG,
  TOKEN_STATUSES,
} = require("../config/constants");
const Token = require("../models/Token");

const serviceMap = new Map(
  SERVICE_CATALOG.map((service) => [service.id, service]),
);

function normalizeId(id) {
  if (!id) {
    return null;
  }

  return typeof id === "string" ? id : id.toString();
}

function getServiceConfig(serviceType) {
  return (
    serviceMap.get(serviceType) || {
      id: serviceType,
      name: serviceType,
      duration: DEFAULT_AVG_SERVICE_TIME,
      description: "Custom service",
    }
  );
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

function getAverageServiceTime(tokens) {
  if (!tokens.length) {
    return DEFAULT_AVG_SERVICE_TIME;
  }

  const total = tokens.reduce((sum, token) => {
    const service = getServiceConfig(token.serviceType);
    return sum + service.duration;
  }, 0);

  return Math.max(1, Math.round(total / tokens.length));
}

function sanitizeActiveQueue(tokens) {
  return tokens
    .filter((token) => token.status !== TOKEN_STATUSES.COMPLETED)
    .sort(sortActiveQueue);
}

function createTokenSnapshot(token, snapshot) {
  if (!token) {
    return null;
  }

  const normalizedTokenId = normalizeId(token._id || token.id);
  const activeQueue = snapshot?.queue || [];
  const activeIndex = activeQueue.findIndex(
    (queueToken) => queueToken.id === normalizedTokenId,
  );
  const service = getServiceConfig(token.serviceType);
  const tokensAhead =
    token.status === TOKEN_STATUSES.WAITING && activeIndex >= 0 ? activeIndex : 0;
  const estimatedWaitingTime =
    token.status === TOKEN_STATUSES.WAITING
      ? tokensAhead * (snapshot?.stats?.avgServiceTime || DEFAULT_AVG_SERVICE_TIME)
      : 0;

  return {
    id: normalizedTokenId,
    tokenNumber: token.tokenNumber,
    status: token.status,
    serviceType: token.serviceType,
    serviceName: service.name,
    timeSlot: token.timeSlot || null,
    estimatedTime:
      token.status === TOKEN_STATUSES.WAITING
        ? token.estimatedTime ?? estimatedWaitingTime
        : 0,
    estimatedWaitingTime,
    tokensAhead,
    isCurrent: token.status === TOKEN_STATUSES.SERVING,
    wasSkipped: Boolean(token.wasSkipped),
    createdAt: token.createdAt,
    updatedAt: token.updatedAt,
    calledAt: token.calledAt,
    completedAt: token.completedAt,
    position: activeIndex >= 0 ? activeIndex + 1 : null,
  };
}

async function syncQueueEstimates() {
  const activeDocs = await Token.find({
    status: {
      $in: [TOKEN_STATUSES.WAITING, TOKEN_STATUSES.SERVING],
    },
  }).sort({ tokenNumber: 1 });

  const activeQueue = sanitizeActiveQueue(activeDocs);
  const avgServiceTime = getAverageServiceTime(activeQueue);

  const operations = activeQueue.reduce((updates, token, index) => {
    const estimatedTime =
      token.status === TOKEN_STATUSES.WAITING ? index * avgServiceTime : 0;

    if (token.estimatedTime !== estimatedTime) {
      updates.push({
        updateOne: {
          filter: { _id: token._id },
          update: { $set: { estimatedTime } },
        },
      });
    }

    return updates;
  }, []);

  if (operations.length) {
    await Token.bulkWrite(operations);
  }

  return {
    activeQueue,
    avgServiceTime,
  };
}

async function buildQueueSnapshot(tokenId) {
  const allTokens = await Token.find({}).sort({ tokenNumber: 1 }).lean();
  const activeQueueDocs = sanitizeActiveQueue(allTokens);
  const avgServiceTime = getAverageServiceTime(activeQueueDocs);

  const queue = activeQueueDocs.map((token, index) => {
    const service = getServiceConfig(token.serviceType);
    const tokensAhead =
      token.status === TOKEN_STATUSES.WAITING ? index : 0;

    return {
      id: normalizeId(token._id),
      tokenNumber: token.tokenNumber,
      status: token.status,
      serviceType: token.serviceType,
      serviceName: service.name,
      timeSlot: token.timeSlot || null,
      estimatedTime:
        token.status === TOKEN_STATUSES.WAITING ? index * avgServiceTime : 0,
      estimatedWaitingTime:
        token.status === TOKEN_STATUSES.WAITING ? index * avgServiceTime : 0,
      tokensAhead,
      isCurrent: token.status === TOKEN_STATUSES.SERVING,
      wasSkipped: Boolean(token.wasSkipped),
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
      calledAt: token.calledAt,
      completedAt: token.completedAt,
      position: index + 1,
    };
  });

  const completedQueue = allTokens
    .filter((token) => token.status === TOKEN_STATUSES.COMPLETED)
    .sort((first, second) => second.tokenNumber - first.tokenNumber)
    .map((token) => {
      const service = getServiceConfig(token.serviceType);

      return {
        id: normalizeId(token._id),
        tokenNumber: token.tokenNumber,
        status: token.status,
        serviceType: token.serviceType,
        serviceName: service.name,
        timeSlot: token.timeSlot || null,
        estimatedTime: 0,
        estimatedWaitingTime: 0,
        tokensAhead: 0,
        isCurrent: false,
        wasSkipped: Boolean(token.wasSkipped),
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
        calledAt: token.calledAt,
        completedAt: token.completedAt,
        position: null,
      };
    });

  const currentServing =
    queue.find((token) => token.status === TOKEN_STATUSES.SERVING) || null;
  const nextUp =
    queue.find((token) => token.status === TOKEN_STATUSES.WAITING) || null;
  const targetToken = tokenId
    ? allTokens.find((token) => normalizeId(token._id) === tokenId)
    : null;

  const snapshot = {
    stats: {
      totalTokens: allTokens.length,
      activeQueue: queue.length,
      completedTokens: completedQueue.length,
      waitingTokens: queue.filter(
        (token) => token.status === TOKEN_STATUSES.WAITING,
      ).length,
      avgServiceTime,
    },
    currentServing,
    nextUp,
    queue,
    completedQueue: completedQueue.slice(0, 12),
    services: SERVICE_CATALOG,
    generatedAt: new Date().toISOString(),
  };

  if (targetToken) {
    snapshot.myToken = createTokenSnapshot(targetToken, snapshot);
  }

  return snapshot;
}

module.exports = {
  buildQueueSnapshot,
  createTokenSnapshot,
  getAverageServiceTime,
  sortActiveQueue,
  syncQueueEstimates,
};
