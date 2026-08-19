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

const supportSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      unique: true
    },
    step: {
      type: String,
      enum: ["language", "group", "details"],
      required: true
    },
    language: {
      type: String,
      enum: ["vi", "en"],
      default: "en"
    },
    groupQuery: {
      type: String,
      default: ""
    },
    matchedChats: {
      type: [matchedChatSchema],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

supportSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 60 });

const SupportSession =
  mongoose.models.SupportSession ?? mongoose.model("SupportSession", supportSessionSchema);

module.exports = {
  SupportSession
};
