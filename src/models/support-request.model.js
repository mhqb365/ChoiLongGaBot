const mongoose = require("mongoose");

const matchedChatSchema = new mongoose.Schema(
  {
    chatId: {
      type: Number,
      required: true
    },
    title: String,
    username: String,
    type: String
  },
  { _id: false }
);

const requesterSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true
    },
    firstName: String,
    lastName: String,
    username: String,
    languageCode: String
  },
  { _id: false }
);

const moderationContextSchema = new mongoose.Schema(
  {
    chatId: {
      type: Number,
      required: true
    },
    warningCount: {
      type: Number,
      default: 0
    },
    banCount: {
      type: Number,
      default: 0
    },
    latestWarningReason: String,
    latestWarningAt: Date,
    latestWarningMatchedKeyword: String,
    latestBanReason: String,
    latestBanAt: Date,
    latestMatchedKeyword: String
  },
  { _id: false }
);

const supportRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: requesterSchema,
      required: true
    },
    groupQuery: {
      type: String,
      required: true,
      trim: true
    },
    details: {
      type: String,
      required: true,
      trim: true
    },
    language: {
      type: String,
      enum: ["vi", "en"],
      default: "en"
    },
    matchedChats: {
      type: [matchedChatSchema],
      default: []
    },
    moderationContext: {
      type: [moderationContextSchema],
      default: []
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending"
    },
    resolutionAction: {
      type: String,
      enum: ["unlock", "unban", "ignore", ""],
      default: ""
    },
    resolvedAt: Date,
    resolvedBy: Number,
    resolutionMessage: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

supportRequestSchema.index({ "matchedChats.chatId": 1, createdAt: -1 });
supportRequestSchema.index({ "matchedChats.chatId": 1, status: 1, createdAt: -1 });
supportRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const SupportRequest =
  mongoose.models.SupportRequest ?? mongoose.model("SupportRequest", supportRequestSchema);

module.exports = {
  SupportRequest
};
