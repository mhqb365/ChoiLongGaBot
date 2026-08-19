const { COMMANDS } = require("../constants/commands.js");
const { replyTargetResolutionError } = require("./id.controller.js");
const { formatModerationReport, toReportMessage } = require("../services/report.service.js");
const { t } = require("../utils/i18n.js");
const { resolveTelegramUserId } = require("../utils/telegram-user.js");
const { getCommandInput, startsWithCommand } = require("../utils/text.js");
const { WARNING_LIMIT, toWarningMessage } = require("../utils/warnings.js");

const handleWarnCommand = async ({
  language,
  message,
  settings,
  text,
  store,
  identityService,
  isAdmin,
  banAndPurge,
  replyTemporary
}) => {
  const { chat, date, from, reply_to_message: targetMessage, message_id: messageId } = message;
  const replyOptions = { deleteAfterMs: settings.commandReplyDeleteMs };
  if (!startsWithCommand(text, COMMANDS.warn) || !(await isAdmin(chat.id, from.id))) {
    return false;
  }

  const input = getCommandInput(text, COMMANDS.warn).trim();
  let targetUserId;
  try {
    targetUserId = targetMessage?.from?.id ?? (await resolveTelegramUserId(input, identityService));
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
    await replyTemporary(chat.id, t(language, "warn.usage"), messageId, replyOptions);
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

  const warning = await store.incrementWarning(chat.id, targetUserId, {
    reason: "manual /warn command"
  });
  if (warning.count <= WARNING_LIMIT) {
    await replyTemporary(
      chat.id,
      t(language, "warn.done", {
        userId: targetUserId,
        count: warning.count,
        max: WARNING_LIMIT
      }),
      messageId,
      replyOptions
    );
    return true;
  }

  const { skippedReason } = await banAndPurge(chat.id, targetUserId, {
    messageIds: [targetMessage?.message_id]
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

  await store.clearWarnings(chat.id, targetUserId);

  const manualWarnMessage =
    targetMessage?.from?.id === targetUserId
      ? { ...targetMessage, chat: targetMessage.chat ?? chat }
      : toWarningMessage({ chat, date, messageId, userId: targetUserId });

  await store.recordBanLog({
    message: manualWarnMessage,
    reason: "manual /warn threshold"
  });

  const report = formatModerationReport({
    language,
    reason: t(language, "reasons.manualWarnThreshold"),
    targetMessage: toReportMessage(manualWarnMessage)
  });
  await replyTemporary(chat.id, report, messageId, replyOptions);
  return true;
};

module.exports = {
  handleWarnCommand
};
