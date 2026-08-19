const { formatModerationReport, toReportMessage } = require("../services/report.service.js");
const { t } = require("../utils/i18n.js");

const isStoryMessage = (message) => Boolean(message.story);

// Story message có thể chỉ xóa hoặc vừa ban vừa ghi log tùy cấu hình group.
const handleStoryMessage = async ({
  language,
  message,
  settings,
  store,
  banAndPurge,
  deleteMessageQuietly,
  replyTemporary
}) => {
  if (!isStoryMessage(message)) {
    return false;
  }

  const { chat, from } = message;
  if (!settings.cleanStoryMessages && !settings.banStorySenders) {
    return false;
  }

  let banned = false;
  if (settings.banStorySenders) {
    const { skippedReason } = await banAndPurge(chat.id, from.id);
    if (skippedReason) {
      console.log(`Skipped ${from.id} in ${chat.id} for story message: ${skippedReason}`);
    } else {
      banned = true;
      console.log(`Banned ${from.id} in ${chat.id} for story message`);
      await store.recordBanLog({
        message,
        reason: "story message"
      });

      const report = formatModerationReport({
        language,
        reason: t(language, "reasons.storyMessage"),
        targetMessage: toReportMessage(message)
      });
      await replyTemporary(chat.id, report, message.message_id);
    }
  }

  if (!banned && (settings.cleanStoryMessages || settings.banStorySenders)) {
    await deleteMessageQuietly(chat.id, message.message_id);
  }

  return true;
};

module.exports = {
  handleStoryMessage
};
