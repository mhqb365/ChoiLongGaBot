const { COMMANDS } = require("../constants/commands.js");
const { replyTargetResolutionError } = require("./id.controller.js");
const { t } = require("../utils/i18n.js");
const { resolveTelegramUserId } = require("../utils/telegram-user.js");
const { getCommandInput, startsWithCommand } = require("../utils/text.js");

const getValidMessageIds = (messageIds) => messageIds.filter(Boolean);

const handleUnlockCommand = async ({
  language,
  message,
  settings,
  text,
  store,
  identityService,
  isAdmin,
  unrestrictUser,
  deleteMessageQuietly,
  replyTemporary
}) => {
  const { chat, from, reply_to_message: targetMessage, message_id: messageId } = message;
  const replyOptions = { deleteAfterMs: settings.commandReplyDeleteMs };
  if (!startsWithCommand(text, COMMANDS.unlock) || !(await isAdmin(chat.id, from.id))) {
    return false;
  }

  const input = getCommandInput(text, COMMANDS.unlock).trim();
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
    await replyTemporary(chat.id, t(language, "unlock.usage"), messageId, replyOptions);
    return true;
  }

  const pending = await store.getPendingVerificationByUser(chat.id, targetUserId);

  try {
    await unrestrictUser(chat.id, targetUserId);
    await store.deletePendingVerification(chat.id, targetUserId);
  } catch (error) {
    await replyTemporary(
      chat.id,
      t(language, "common.skipped", { reason: error.message }),
      messageId,
      replyOptions
    );
    return true;
  }

  await Promise.all(
    getValidMessageIds([pending?.messageId, pending?.joinMessageId]).map((pendingMessageId) =>
      deleteMessageQuietly(chat.id, pendingMessageId)
    )
  );

  await replyTemporary(
    chat.id,
    t(language, "unlock.done", { userId: targetUserId }),
    messageId,
    replyOptions
  );
  return true;
};

module.exports = {
  handleUnlockCommand
};
