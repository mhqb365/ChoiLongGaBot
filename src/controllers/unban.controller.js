const { COMMANDS } = require("../constants/commands.js");
const { replyTargetResolutionError } = require("./id.controller.js");
const { t } = require("../utils/i18n.js");
const { resolveTelegramUserId } = require("../utils/telegram-user.js");
const { getCommandInput, startsWithCommand } = require("../utils/text.js");

const handleUnbanCommand = async ({
  language,
  message,
  settings,
  text,
  store,
  identityService,
  isAdmin,
  unbanUser,
  replyTemporary
}) => {
  const { chat, from, reply_to_message: targetMessage, message_id: messageId } = message;
  const replyOptions = { deleteAfterMs: settings.commandReplyDeleteMs };
  if (!startsWithCommand(text, COMMANDS.unban) || !(await isAdmin(chat.id, from.id))) {
    return false;
  }

  const input = getCommandInput(text, COMMANDS.unban).trim();
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
    await replyTemporary(chat.id, t(language, "unban.usage"), messageId, replyOptions);
    return true;
  }

  try {
    await unbanUser(chat.id, targetUserId);
    await store.clearWarnings(chat.id, targetUserId);
    await store.recordUnbanLog({
      adminUserId: from.id,
      chatId: chat.id,
      reason: "manual /unban command",
      source: "command",
      userId: targetUserId
    });
  } catch (error) {
    await replyTemporary(
      chat.id,
      t(language, "common.skipped", { reason: error.message }),
      messageId,
      replyOptions
    );
    return true;
  }

  await replyTemporary(
    chat.id,
    t(language, "unban.done", { userId: targetUserId }),
    messageId,
    replyOptions
  );
  return true;
};

module.exports = {
  handleUnbanCommand
};
