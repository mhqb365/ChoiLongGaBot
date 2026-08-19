const mongoose = require("mongoose");

// Mỗi chat có một bản cấu hình bật/tắt các chế độ dọn dẹp và ban tự động.
const chatSettingsSchema = new mongoose.Schema(
  {
    chatId: {
      type: Number,
      required: true,
      unique: true
    },
    cleanServiceMessages: {
      type: Boolean,
      default: false
    },
    cleanLinkMessages: {
      type: Boolean,
      default: false
    },
    banLinkSenders: {
      type: Boolean,
      default: false
    },
    cleanStoryMessages: {
      type: Boolean,
      default: false
    },
    banStorySenders: {
      type: Boolean,
      default: false
    },
    memberVerificationEnabled: {
      type: Boolean,
      default: false
    },
    memberVerificationTimeoutMinutes: {
      type: Number,
      min: 1,
      max: 60,
      default: 1
    },
    commandReplyDeleteSeconds: {
      type: Number,
      min: 1,
      max: 60,
      default: 3
    },
    language: {
      type: String,
      enum: ["vi", "en"],
      default: "en"
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const ChatSettings =
  mongoose.models.ChatSettings ?? mongoose.model("ChatSettings", chatSettingsSchema);

module.exports = {
  ChatSettings
};
