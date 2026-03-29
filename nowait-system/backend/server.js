const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🧠 Queue State
let currentToken = 0;
let servingToken = 0;

// 🔌 Socket Connection
io.on("connection", (socket) => {
  console.log("User connected");

  // 🎟️ Generate Token
  socket.on("getToken", () => {
    currentToken++;

    socket.emit("tokenGenerated", currentToken);

    io.emit("queueUpdate", {
      currentToken,
      servingToken,
    });
  });

  // ⏭️ Next Token
  socket.on("nextToken", () => {
    if (servingToken < currentToken) {
      servingToken++;

      io.emit("queueUpdate", {
        currentToken,
        servingToken,
      });
    }
  });

  // 🔄 Send initial state
  socket.emit("queueUpdate", {
    currentToken,
    servingToken,
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});