const { COMMANDS } = require("../constants/commands.js");
const { replyTargetResolutionError } = require("./id.controller.js");
const { formatModerationReport, toReportMessage } = require("../services/report.service.js");
const { t } = require("../utils/i18n.js");
const { resolveTelegramUserId } = require("../utils/telegram-user.js");
const { getCommandInput, startsWithCommand } = require("../utils/text.js");

const toManualBanMessage = ({ chat, date, messageId, userId }) => ({
  chat,
  date,
  from: { id: userId },
  message_id: messageId
});

// Ban thủ công: hỗ trợ cả reply message và nhập thẳng user ID.
const handleBanCommand = async ({
  language,
  message,
  settings,
  text,
  store,
  identityService,
  isAdmin,
  banAndPurge,
  replyPhotoTemporary,
  replyTemporary
}) => {
  const { chat, date, from, reply_to_message: targetMessage, message_id: messageId } = message;
  const replyOptions = { deleteAfterMs: settings.commandReplyDeleteMs };
  if (!startsWithCommand(text, COMMANDS.ban) || !(await isAdmin(chat.id, from.id))) {
    return false;
  }

  const input = getCommandInput(text, COMMANDS.ban).trim();
  if (!targetMessage?.from?.id) {
    let targetUserId;
    try {
      targetUserId = await resolveTelegramUserId(input, identityService);
    } catch (error) {
      await replyTemporary(
        chat.id,
        replyTargetResolutionError(language, error),
        messageId,
        replyOptions
      );
      return true;
    }

    if (!targetUserId) {
      await replyTemporary(chat.id, t(language, "ban.usage"), messageId, replyOptions);
      return true;
    }

    try {
      const { skippedReason } = await banAndPurge(chat.id, targetUserId);
      if (skippedReason) {
        await replyTemporary(
          chat.id,
          t(language, "common.skipped", {
            reason: t(language, `skipReasons.${skippedReason}`)
          }),
          messageId,
          replyOptions
        );
        return true;
      }
    } catch (error) {
      await replyTemporary(
        chat.id,
        t(language, "common.skipped", { reason: error.message }),
        messageId,
        replyOptions
      );
      return true;
    }

    const manualBanMessage = toManualBanMessage({
      chat,
      date,
      messageId,
      userId: targetUserId
    });
    await store.recordBanLog({
      message: manualBanMessage,
      reason: "manual /ban command by user ID"
    });

    const report = formatModerationReport({
      contentMaxLength: 420,
      language,
      reason: t(language, "reasons.manualBanByUserId"),
      targetMessage: toReportMessage(manualBanMessage)
    });
    await replyPhotoTemporary(chat.id, report, messageId, replyOptions);
    return true;
  }

  const { skippedReason } = await banAndPurge(chat.id, targetMessage.from.id, {
    messageIds: [targetMessage.message_id]
  });
  if (skippedReason) {
    await replyTemporary(
      chat.id,
      t(language, "common.skipped", {
        reason: t(language, `skipReasons.${skippedReason}`)
      }),
      messageId,
      replyOptions
    );
    return true;
  }

  await store.recordBanLog({
    message: { ...targetMessage, chat: targetMessage.chat ?? chat },
    reason: "manual /ban command"
  });

  const report = formatModerationReport({
    contentMaxLength: 420,
    language,
    reason: t(language, "reasons.manualBan"),
    targetMessage: toReportMessage(targetMessage)
  });
  await replyPhotoTemporary(chat.id, report, messageId, replyOptions);
  return true;
};

module.exports = {
  handleBanCommand
};
