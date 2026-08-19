const mongoose = require("mongoose");

const verificationStatusSchema = new mongoose.Schema(
  {
    chatId: {
      type: Number,
      required: true
    },
    userId: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "verified", "expired"],
      required: true
    },
    expiresAt: {
      type: Date,
      default: null
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0
    },
    updatedBy: {
      type: String,
      default: "system"
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

verificationStatusSchema.index({ chatId: 1, userId: 1 }, { unique: true });
verificationStatusSchema.index({ chatId: 1, status: 1, updatedAt: -1 });

const VerificationStatus =
  mongoose.models.VerificationStatus ??
  mongoose.model("VerificationStatus", verificationStatusSchema);

module.exports = {
  VerificationStatus
};
