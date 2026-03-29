require("dotenv").config();

const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const http = require("http");

const connectDB = require("./config/db");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const queueRoutes = require("./routes/queueRoutes");
const { initializeSocket } = require("./sockets/queueSocket");

const PORT = Number(process.env.PORT || 5000);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    message: "NoWait backend is healthy.",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", queueRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

initializeSocket(server);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`NoWait backend listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB.", error);
    process.exit(1);
  });
