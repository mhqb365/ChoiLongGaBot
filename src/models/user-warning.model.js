const mongoose = require("mongoose");

const userWarningSchema = new mongoose.Schema(
  {
    chatId: {
      type: Number,
      required: true
    },
    userId: {
      type: Number,
      required: true
    },
    count: {
      type: Number,
      default: 0
    },
    lastReason: {
      type: String,
      default: ""
    },
    lastMatchedKeyword: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userWarningSchema.index({ chatId: 1, userId: 1 }, { unique: true });
userWarningSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const UserWarning = mongoose.models.UserWarning ?? mongoose.model("UserWarning", userWarningSchema);

module.exports = {
  UserWarning
};
