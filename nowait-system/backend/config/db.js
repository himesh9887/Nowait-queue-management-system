const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nowait-system";

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDB;
