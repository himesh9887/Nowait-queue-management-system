const mongoose = require("mongoose");

const { SERVICE_CATALOG, TOKEN_STATUSES } = require("../config/constants");

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
      min: 1,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(TOKEN_STATUSES),
      default: TOKEN_STATUSES.WAITING,
      index: true,
    },
    serviceType: {
      type: String,
      required: true,
      enum: SERVICE_CATALOG.map((service) => service.id),
    },
    timeSlot: {
      type: String,
      default: null,
      trim: true,
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

module.exports = mongoose.model("Token", tokenSchema);
