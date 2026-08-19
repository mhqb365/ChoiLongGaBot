const mongoose = require("mongoose");

const filterRuleSchema = new mongoose.Schema(
  {
    chatId: { type: Number, required: true },
    trigger: { type: String, required: true, trim: true, lowercase: true },
    replyText: { type: String, required: true, trim: true }
  },
  { timestamps: true, versionKey: false }
);

filterRuleSchema.index({ chatId: 1, trigger: 1 }, { unique: true });

const FilterRule = mongoose.models.FilterRule ?? mongoose.model("FilterRule", filterRuleSchema);

module.exports = { FilterRule };
