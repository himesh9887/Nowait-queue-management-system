const { Server } = require("socket.io");

const { buildQueueSnapshot } = require("../utils/queueMetrics");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", async (socket) => {
    try {
      const snapshot = await buildQueueSnapshot();
      socket.emit("queueUpdated", snapshot);
    } catch (_error) {
      socket.emit("queueError", {
        message: "Unable to load the queue snapshot right now.",
      });
    }
  });

  return io;
}

function emitQueueUpdated(snapshot) {
  if (io) {
    io.emit("queueUpdated", snapshot);
  }
}

function emitTokenBooked(token) {
  if (io) {
    io.emit("tokenBooked", token);
  }
}

function emitTokenCalled(token) {
  if (io) {
    io.emit("tokenCalled", token);
  }
}

module.exports = {
  emitQueueUpdated,
  emitTokenBooked,
  emitTokenCalled,
  initializeSocket,
};
