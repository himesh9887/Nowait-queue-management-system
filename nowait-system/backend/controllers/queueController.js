const QueueCounter = require("../models/QueueCounter");
const Token = require("../models/Token");
const { TOKEN_STATUSES } = require("../config/constants");
const { resolveBookingDay } = require("../utils/bookingDay");
const {
  buildQueueSnapshot,
  createTokenSnapshot,
  syncQueueEstimates,
} = require("../utils/queueMetrics");
const {
  emitQueueUpdated,
  emitTokenBooked,
  emitTokenCalled,
} = require("../sockets/queueSocket");

function normalizeBodyValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function resolveBookingUser(req) {
  if (req.user?.id && req.user?.displayName) {
    return {
      userId: String(req.user.id).trim(),
      userDisplayName: String(req.user.displayName).trim(),
    };
  }

  return {
    userId: normalizeBodyValue(req.body?.userId),
    userDisplayName: normalizeBodyValue(req.body?.userDisplayName),
  };
}

async function getNextTokenNumber(dayKey) {
  const counter = await QueueCounter.findOneAndUpdate(
    { key: `queue:${dayKey}` },
    { $inc: { currentValue: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return counter.currentValue;
}

function getRequestedDay(req) {
  return resolveBookingDay(
    normalizeBodyValue(req.body?.day || req.body?.bookingDay || req.query?.day),
  );
}

async function bookToken(req, res, next) {
  try {
    const { userId, userDisplayName } = resolveBookingUser(req);
    const bookingDay = getRequestedDay(req);

    if (!userId || !userDisplayName) {
      return res.status(400).json({
        message: "Both userId and userDisplayName are required to book a token.",
      });
    }

    if (!bookingDay) {
      return res.status(400).json({
        message: "Booking day must be either today or tomorrow.",
      });
    }

    const existingActiveToken = await Token.findOne({
      userId,
      bookingDayKey: bookingDay.key,
      status: {
        $in: [TOKEN_STATUSES.WAITING, TOKEN_STATUSES.SERVING],
      },
    }).sort({ tokenNumber: -1 });

    if (existingActiveToken) {
      await syncQueueEstimates(bookingDay.key);

      const snapshot = await buildQueueSnapshot({
        userId,
        day: bookingDay.relativeLabel,
      });

      return res.status(409).json({
        message: `You already have an active ${bookingDay.label.toLowerCase()} token.`,
        token: createTokenSnapshot(existingActiveToken, snapshot),
        snapshot,
      });
    }

    const tokenNumber = await getNextTokenNumber(bookingDay.key);
    const token = await Token.create({
      userId,
      userDisplayName,
      tokenNumber,
      bookingDate: bookingDay.bookingDate,
      bookingDayKey: bookingDay.key,
      status: TOKEN_STATUSES.WAITING,
    });

    await syncQueueEstimates(bookingDay.key);

    const snapshot = await buildQueueSnapshot({
      tokenId: token._id.toString(),
      userId,
      day: bookingDay.relativeLabel,
    });
    const tokenSnapshot = snapshot.myToken || createTokenSnapshot(token, snapshot);

    emitTokenBooked(tokenSnapshot);
    emitQueueUpdated(snapshot);

    return res.status(201).json({
      message: `Token ${tokenNumber} booked for ${bookingDay.label.toLowerCase()}.`,
      token: tokenSnapshot,
      snapshot,
    });
  } catch (error) {
    return next(error);
  }
}

async function getQueueStatus(req, res, next) {
  try {
    const bookingDay = getRequestedDay(req);
    const userId = req.user?.id || normalizeBodyValue(req.query?.userId) || null;

    if (!bookingDay) {
      return res.status(400).json({
        message: "Queue day must be either today or tomorrow.",
      });
    }

    await syncQueueEstimates(bookingDay.key);

    const snapshot = await buildQueueSnapshot({
      tokenId: normalizeBodyValue(req.query?.tokenId) || null,
      userId,
      day: bookingDay.relativeLabel,
    });

    return res.status(200).json({
      ...snapshot,
      currentServingToken: snapshot.currentServing?.tokenNumber || null,
      totalTokens: snapshot.stats.totalTokens,
      waitingTokens: snapshot.stats.waitingTokens,
    });
  } catch (error) {
    return next(error);
  }
}

async function getBookings(req, res, next) {
  try {
    const bookingDay = getRequestedDay(req);
    const filters = {};
    const requestedStatus = normalizeBodyValue(req.query?.status);

    if (!bookingDay) {
      return res.status(400).json({
        message: "Booking day must be either today or tomorrow.",
      });
    }

    if (requestedStatus && Object.values(TOKEN_STATUSES).includes(requestedStatus)) {
      filters.status = requestedStatus;
    }

    filters.bookingDayKey = bookingDay.key;

    await syncQueueEstimates(bookingDay.key);

    const bookings = await Token.find(filters).sort({ tokenNumber: -1 }).lean();
    const snapshot = await buildQueueSnapshot({
      day: bookingDay.relativeLabel,
    });

    return res.status(200).json({
      bookings: bookings.map((token) => createTokenSnapshot(token, snapshot)),
      stats: snapshot.stats,
      selectedDay: snapshot.selectedDay,
      days: snapshot.days,
    });
  } catch (error) {
    return next(error);
  }
}

async function nextToken(req, res, next) {
  try {
    const bookingDay = getRequestedDay(req);

    if (!bookingDay) {
      return res.status(400).json({
        message: "Queue day must be either today or tomorrow.",
      });
    }

    if (!bookingDay.canServe) {
      return res.status(400).json({
        message: "Tomorrow bookings cannot be served today.",
      });
    }

    const currentServing = await Token.findOne({
      bookingDayKey: bookingDay.key,
      status: TOKEN_STATUSES.SERVING,
    }).sort({ tokenNumber: 1 });

    if (currentServing) {
      currentServing.status = TOKEN_STATUSES.COMPLETED;
      currentServing.completedAt = new Date();
      currentServing.estimatedTime = 0;
      await currentServing.save();
    }

    const nextWaiting = await Token.findOne({
      bookingDayKey: bookingDay.key,
      status: TOKEN_STATUSES.WAITING,
    }).sort({ tokenNumber: 1 });

    if (!currentServing && !nextWaiting) {
      return res.status(404).json({
        message: "There are no waiting tokens in the selected queue.",
      });
    }

    if (nextWaiting) {
      nextWaiting.status = TOKEN_STATUSES.SERVING;
      nextWaiting.calledAt = new Date();
      nextWaiting.estimatedTime = 0;
      await nextWaiting.save();
    }

    await syncQueueEstimates(bookingDay.key);

    const snapshot = await buildQueueSnapshot({
      day: bookingDay.relativeLabel,
    });

    emitTokenCalled(snapshot.currentServing);
    emitQueueUpdated(snapshot);

    return res.status(200).json({
      message: snapshot.currentServing
        ? `Token ${snapshot.currentServing.tokenNumber} is now being served.`
        : "Queue advanced successfully.",
      currentServing: snapshot.currentServing,
      snapshot,
    });
  } catch (error) {
    return next(error);
  }
}

async function skipToken(req, res, next) {
  try {
    const bookingDay = getRequestedDay(req);

    if (!bookingDay) {
      return res.status(400).json({
        message: "Queue day must be either today or tomorrow.",
      });
    }

    if (!bookingDay.canServe) {
      return res.status(400).json({
        message: "Tomorrow bookings cannot be served today.",
      });
    }

    let skippedToken = await Token.findOne({
      bookingDayKey: bookingDay.key,
      status: TOKEN_STATUSES.SERVING,
    }).sort({ tokenNumber: 1 });

    if (!skippedToken) {
      skippedToken = await Token.findOne({
        bookingDayKey: bookingDay.key,
        status: TOKEN_STATUSES.WAITING,
      }).sort({ tokenNumber: 1 });
    }

    if (!skippedToken) {
      return res.status(404).json({
        message: "There are no tokens available to skip.",
      });
    }

    skippedToken.status = TOKEN_STATUSES.COMPLETED;
    skippedToken.completedAt = new Date();
    skippedToken.wasSkipped = true;
    skippedToken.estimatedTime = 0;
    await skippedToken.save();

    const nextWaiting = await Token.findOne({
      bookingDayKey: bookingDay.key,
      status: TOKEN_STATUSES.WAITING,
    }).sort({ tokenNumber: 1 });

    if (nextWaiting) {
      nextWaiting.status = TOKEN_STATUSES.SERVING;
      nextWaiting.calledAt = new Date();
      nextWaiting.estimatedTime = 0;
      await nextWaiting.save();
    }

    await syncQueueEstimates(bookingDay.key);

    const snapshot = await buildQueueSnapshot({
      day: bookingDay.relativeLabel,
    });

    emitTokenCalled(snapshot.currentServing);
    emitQueueUpdated(snapshot);

    return res.status(200).json({
      message: `Token ${skippedToken.tokenNumber} skipped successfully.`,
      skippedToken: createTokenSnapshot(skippedToken, snapshot),
      snapshot,
    });
  } catch (error) {
    return next(error);
  }
}

async function resetQueue(req, res, next) {
  try {
    const bookingDay = getRequestedDay(req);

    if (!bookingDay) {
      return res.status(400).json({
        message: "Queue day must be either today or tomorrow.",
      });
    }

    await Token.deleteMany({
      bookingDayKey: bookingDay.key,
    });
    await QueueCounter.findOneAndUpdate(
      { key: `queue:${bookingDay.key}` },
      { $set: { currentValue: 0 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    const snapshot = await buildQueueSnapshot({
      day: bookingDay.relativeLabel,
    });

    emitTokenCalled(null);
    emitQueueUpdated(snapshot);

    return res.status(200).json({
      message: `${bookingDay.label} queue reset successfully.`,
      snapshot,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  bookToken,
  getBookings,
  getQueueStatus,
  nextToken,
  resetQueue,
  skipToken,
};
