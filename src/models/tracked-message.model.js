const mongoose = require("mongoose");

// Message đã track dùng cho /clean và tự hết hạn sau 30 ngày.
const trackedMessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: Number,
      required: true
    },
    userId: {
      type: Number,
      required: true
    },
    messageId: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

trackedMessageSchema.index({ chatId: 1, messageId: 1 }, { unique: true });
trackedMessageSchema.index({ chatId: 1, userId: 1, createdAt: -1 });
trackedMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const TrackedMessage =
  mongoose.models.TrackedMessage ?? mongoose.model("TrackedMessage", trackedMessageSchema);

module.exports = {
  TrackedMessage
};
