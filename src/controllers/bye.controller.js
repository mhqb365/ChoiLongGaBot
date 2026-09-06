const { COMMANDS } = require("../constants/commands.js");
const { replyTargetResolutionError } = require("./id.controller.js");
const { formatModerationReport, toReportMessage } = require("../services/report.service.js");
const { t } = require("../utils/i18n.js");
const { resolveTelegramUserId } = require("../utils/telegram-user.js");
const { getCommandInput, startsWithCommand } = require("../utils/text.js");

const toManualByeMessage = ({ chat, date, messageId, userId }) => ({
  chat,
  date,
  from: { id: userId },
  message_id: messageId
});

const handleByeCommand = async ({
  language,
  message,
  settings,
  text,
  store,
  identityService,
  isAdmin,
  banAndPurge,
  deleteMessagesQuietly,
  replyPhotoTemporary,
  replyTemporary
}) => {
  const { chat, date, from, reply_to_message: targetMessage, message_id: messageId } = message;
  const replyOptions = { deleteAfterMs: settings.commandReplyDeleteMs };
  if (!startsWithCommand(text, COMMANDS.bye) || !(await isAdmin(chat.id, from.id))) {
    return false;
  }

  const input = getCommandInput(text, COMMANDS.bye).trim();
  let targetUserId = targetMessage?.from?.id;

  if (!targetUserId && input) {
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
  }

  if (!targetUserId) {
    await replyTemporary(chat.id, t(language, "bye.usage"), messageId, replyOptions);
    return true;
  }

  if (await isAdmin(chat.id, targetUserId)) {
    await replyTemporary(
      chat.id,
      t(language, "common.skipped", {
        reason: t(language, "skipReasons.targetAdmin")
      }),
      messageId,
      replyOptions
    );
    return true;
  }

  const messageIds = await store.listTrackedMessageIds(chat.id, targetUserId);
  if (targetMessage?.message_id) {
    messageIds.push(targetMessage.message_id);
  }
  const uniqueMessageIds = [...new Set(messageIds)];
  const { deletedCount } = await deleteMessagesQuietly(chat.id, uniqueMessageIds);
  await store.removeTrackedMessages(chat.id, uniqueMessageIds);

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

  const byeMessage =
    targetMessage?.from?.id === targetUserId
      ? { ...targetMessage, chat: targetMessage.chat ?? chat }
      : toManualByeMessage({ chat, date, messageId, userId: targetUserId });

  await store.recordBanLog({
    message: byeMessage,
    reason: "manual /bye command"
  });

  const report = formatModerationReport({
    contentMaxLength: 420,
    language,
    reason: t(language, "reasons.manualBye"),
    targetMessage: toReportMessage(byeMessage)
  });
  await replyPhotoTemporary(
    chat.id,
    `${report}\n${t(language, "bye.cleaned", { count: deletedCount })}`,
    messageId,
    replyOptions
  );
  return true;
};

module.exports = {
  handleByeCommand
};
