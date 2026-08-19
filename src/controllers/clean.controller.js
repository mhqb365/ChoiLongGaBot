const { COMMANDS } = require("../constants/commands.js");
const { replyTargetResolutionError } = require("./id.controller.js");
const { t } = require("../utils/i18n.js");
const { resolveTelegramUserId } = require("../utils/telegram-user.js");
const { getCommandInput, startsWithCommand } = require("../utils/text.js");

const handleCleanCommand = async ({
  language,
  message,
  settings,
  text,
  store,
  identityService,
  isAdmin,
  deleteMessagesQuietly,
  replyTemporary
}) => {
  const { chat, from, reply_to_message: targetMessage, message_id: messageId } = message;
  const replyOptions = { deleteAfterMs: settings.commandReplyDeleteMs };
  if (!startsWithCommand(text, COMMANDS.clean) || !(await isAdmin(chat.id, from.id))) {
    return false;
  }

  const input = getCommandInput(text, COMMANDS.clean).trim();
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
    await replyTemporary(chat.id, t(language, "clean.usage"), messageId, replyOptions);
    return true;
  }

  const messageIds = await store.listTrackedMessageIds(chat.id, targetUserId);
  if (targetMessage?.message_id) {
    messageIds.push(targetMessage.message_id);
  }

  const { deletedCount } = await deleteMessagesQuietly(chat.id, [...new Set(messageIds)]);
  await store.removeTrackedMessages(chat.id, messageIds);

  await replyTemporary(
    chat.id,
    t(language, "clean.done", { count: deletedCount, userId: targetUserId }),
    messageId,
    replyOptions
  );
  return true;
};

module.exports = {
  handleCleanCommand
};
