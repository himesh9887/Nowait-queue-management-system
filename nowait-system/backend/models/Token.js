const mongoose = require("mongoose");

const { TOKEN_STATUSES } = require("../config/constants");

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userDisplayName: {
      type: String,
      required: true,
      trim: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    bookingDate: {
      type: Date,
      required: true,
      index: true,
    },
    bookingDayKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(TOKEN_STATUSES),
      default: TOKEN_STATUSES.WAITING,
      index: true,
    },
    estimatedTime: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    calledAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    wasSkipped: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

tokenSchema.index({ bookingDayKey: 1, tokenNumber: 1 }, { unique: true });
tokenSchema.index({ userId: 1, bookingDayKey: 1, status: 1 });

module.exports = mongoose.model("Token", tokenSchema);
