const mongoose = require("mongoose");

const pendingVerificationSchema = new mongoose.Schema(
  {
    chatId: {
      type: Number,
      required: true
    },
    userId: {
      type: Number,
      required: true
    },
    token: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0
    },
    messageId: {
      type: Number,
      required: true
    },
    joinMessageId: {
      type: Number,
      default: null
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

pendingVerificationSchema.index({ chatId: 1, userId: 1 }, { unique: true });

const PendingVerification =
  mongoose.models.PendingVerification ??
  mongoose.model("PendingVerification", pendingVerificationSchema);

module.exports = {
  PendingVerification
};
