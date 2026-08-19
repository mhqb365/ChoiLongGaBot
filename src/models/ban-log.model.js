const mongoose = require("mongoose");

// Snapshot chat/user giúp log không phụ thuộc vào dữ liệu Telegram hiện tại.
const chatSnapshotSchema = new mongoose.Schema(
  {
    id: Number,
    type: String,
    title: String,
    username: String
  },
  { _id: false }
);

const userSnapshotSchema = new mongoose.Schema(
  {
    id: Number,
    isBot: Boolean,
    firstName: String,
    lastName: String,
    username: String,
    languageCode: String
  },
  { _id: false }
);

// Ban log lưu đầy đủ ngữ cảnh để audit các lần bot ban thành viên.
const banLogSchema = new mongoose.Schema(
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
    },
    chat: {
      type: chatSnapshotSchema,
      default: undefined
    },
    user: {
      type: userSnapshotSchema,
      default: undefined
    },
    text: {
      type: String,
      default: ""
    },
    caption: {
      type: String,
      default: ""
    },
    forwardSource: {
      type: String,
      default: ""
    },
    links: {
      type: [String],
      default: []
    },
    messageType: {
      type: String,
      default: "unknown"
    },
    telegramDate: {
      type: Date,
      default: undefined
    },
    reason: String,
    matchedKeyword: String
  },
  {
    timestamps: true,
    versionKey: false
  }
);

banLogSchema.index({ chatId: 1, userId: 1, createdAt: -1 });

const BanLog = mongoose.models.BanLog ?? mongoose.model("BanLog", banLogSchema);

module.exports = {
  BanLog
};
