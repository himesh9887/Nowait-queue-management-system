const { Server } = require("socket.io");

const { buildQueueSnapshot } = require("../utils/queueMetrics");

let io;

function emitQueueSnapshot(target, snapshot) {
  target.emit("queueUpdated", snapshot);
  target.emit("queueUpdate", snapshot);
}

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", async (socket) => {
    async function sendSnapshot() {
      try {
        const snapshot = await buildQueueSnapshot();
        emitQueueSnapshot(socket, snapshot);
      } catch (_error) {
        socket.emit("queueError", {
          message: "Unable to load the queue snapshot right now.",
        });
      }
    }

    socket.on("getToken", () => {
      void sendSnapshot();
    });

    try {
      const snapshot = await buildQueueSnapshot();
      emitQueueSnapshot(socket, snapshot);
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
    emitQueueSnapshot(io, snapshot);
  }
}

function emitTokenBooked(token) {
  if (io) {
    io.emit("tokenBooked", token);
    io.emit("tokenGenerated", token);
  }
}

function emitTokenCalled(token) {
  if (io) {
    io.emit("tokenCalled", token);
  }
}

function emitNotifyNextUser(payload) {
  if (io) {
    io.emit("notifyNextUser", payload);
  }
}

module.exports = {
  emitNotifyNextUser,
  emitQueueUpdated,
  emitTokenBooked,
  emitTokenCalled,
  initializeSocket,
};
