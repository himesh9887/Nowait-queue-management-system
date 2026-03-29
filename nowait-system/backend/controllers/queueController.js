const QueueCounter = require("../models/QueueCounter");
const Token = require("../models/Token");
const { SERVICE_CATALOG, TOKEN_STATUSES } = require("../config/constants");
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

function validateServiceType(serviceType) {
  return SERVICE_CATALOG.some((service) => service.id === serviceType);
}

async function getNextTokenNumber() {
  const counter = await QueueCounter.findOneAndUpdate(
    { key: "global" },
    { $inc: { currentValue: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return counter.currentValue;
}

async function bookToken(req, res, next) {
  try {
    const { serviceType, timeSlot } = req.body ?? {};

    if (!serviceType || !validateServiceType(serviceType)) {
      return res.status(400).json({
        message: "Please select a valid service before booking a token.",
      });
    }

    const tokenNumber = await getNextTokenNumber();

    const token = await Token.create({
      tokenNumber,
      serviceType,
      timeSlot: timeSlot?.trim() || null,
      status: TOKEN_STATUSES.WAITING,
    });

    await syncQueueEstimates();

    const snapshot = await buildQueueSnapshot(token._id.toString());
    const tokenSnapshot = snapshot.myToken || createTokenSnapshot(token, snapshot);

    emitTokenBooked(tokenSnapshot);
    emitQueueUpdated(snapshot);

    return res.status(201).json({
      message: `Token ${tokenNumber} booked successfully.`,
      token: tokenSnapshot,
      snapshot,
    });
  } catch (error) {
    return next(error);
  }
}

async function getQueueStatus(req, res, next) {
  try {
    const { tokenId } = req.query;

    await syncQueueEstimates();

    const snapshot = await buildQueueSnapshot(tokenId);

    return res.status(200).json(snapshot);
  } catch (error) {
    return next(error);
  }
}

async function getBookings(req, res, next) {
  try {
    const filters = {};
    const { status, serviceType } = req.query;

    if (status && Object.values(TOKEN_STATUSES).includes(status)) {
      filters.status = status;
    }

    if (serviceType && validateServiceType(serviceType)) {
      filters.serviceType = serviceType;
    }

    await syncQueueEstimates();

    const bookings = await Token.find(filters).sort({ tokenNumber: -1 }).lean();
    const snapshot = await buildQueueSnapshot();

    return res.status(200).json({
      bookings: bookings.map((token) => createTokenSnapshot(token, snapshot)),
      stats: snapshot.stats,
    });
  } catch (error) {
    return next(error);
  }
}

async function nextToken(req, res, next) {
  try {
    const currentServing = await Token.findOne({
      status: TOKEN_STATUSES.SERVING,
    }).sort({ tokenNumber: 1 });

    if (currentServing) {
      currentServing.status = TOKEN_STATUSES.COMPLETED;
      currentServing.completedAt = new Date();
      currentServing.estimatedTime = 0;
      await currentServing.save();
    }

    const nextWaiting = await Token.findOne({
      status: TOKEN_STATUSES.WAITING,
    }).sort({ tokenNumber: 1 });

    if (!currentServing && !nextWaiting) {
      return res.status(404).json({
        message: "There are no waiting tokens in the queue.",
      });
    }

    if (nextWaiting) {
      nextWaiting.status = TOKEN_STATUSES.SERVING;
      nextWaiting.calledAt = new Date();
      nextWaiting.estimatedTime = 0;
      await nextWaiting.save();
    }

    await syncQueueEstimates();

    const snapshot = await buildQueueSnapshot();

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
    let skippedToken = await Token.findOne({
      status: TOKEN_STATUSES.SERVING,
    }).sort({ tokenNumber: 1 });

    if (!skippedToken) {
      skippedToken = await Token.findOne({
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
      status: TOKEN_STATUSES.WAITING,
    }).sort({ tokenNumber: 1 });

    if (nextWaiting) {
      nextWaiting.status = TOKEN_STATUSES.SERVING;
      nextWaiting.calledAt = new Date();
      nextWaiting.estimatedTime = 0;
      await nextWaiting.save();
    }

    await syncQueueEstimates();

    const snapshot = await buildQueueSnapshot();

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
    await Token.deleteMany({});
    await QueueCounter.findOneAndUpdate(
      { key: "global" },
      { $set: { currentValue: 0 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    const snapshot = await buildQueueSnapshot();

    emitTokenCalled(null);
    emitQueueUpdated(snapshot);

    return res.status(200).json({
      message: "Queue reset successfully.",
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
