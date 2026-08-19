const mongoose = require("mongoose");

const unbanLogSchema = new mongoose.Schema(
  {
    chatId: {
      type: Number,
      required: true
    },
    userId: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      default: ""
    },
    source: {
      type: String,
      enum: ["command", "support"],
      required: true
    },
    adminUserId: Number,
    supportRequestId: String
  },
  {
    timestamps: true,
    versionKey: false
  }
);

unbanLogSchema.index({ chatId: 1, userId: 1, createdAt: -1 });

const UnbanLog = mongoose.models.UnbanLog ?? mongoose.model("UnbanLog", unbanLogSchema);

module.exports = {
  UnbanLog
};
