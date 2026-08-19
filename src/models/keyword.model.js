const mongoose = require("mongoose");

// Keyword bị cấm được lưu riêng theo từng chat/group.
const keywordSchema = new mongoose.Schema(
  {
    chatId: {
      type: Number,
      required: true
    },
    keyword: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

keywordSchema.index({ chatId: 1, keyword: 1 }, { unique: true });

const Keyword = mongoose.models.Keyword ?? mongoose.model("Keyword", keywordSchema);

module.exports = {
  Keyword
};
