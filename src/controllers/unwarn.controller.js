const { COMMANDS } = require("../constants/commands.js");
const { replyTargetResolutionError } = require("./id.controller.js");
const { t } = require("../utils/i18n.js");
const { resolveTelegramUserId } = require("../utils/telegram-user.js");
const { getCommandInput, startsWithCommand } = require("../utils/text.js");

const handleUnwarnCommand = async ({
  language,
  message,
  settings,
  text,
  store,
  identityService,
  isAdmin,
  replyTemporary
}) => {
  const { chat, from, reply_to_message: targetMessage, message_id: messageId } = message;
  const replyOptions = { deleteAfterMs: settings.commandReplyDeleteMs };
  if (!startsWithCommand(text, COMMANDS.unwarn) || !(await isAdmin(chat.id, from.id))) {
    return false;
  }

  const input = getCommandInput(text, COMMANDS.unwarn).trim();
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
    await replyTemporary(chat.id, t(language, "unwarn.usage"), messageId, replyOptions);
    return true;
  }

  await store.clearWarnings(chat.id, targetUserId);
  await replyTemporary(
    chat.id,
    t(language, "unwarn.done", { userId: targetUserId }),
    messageId,
    replyOptions
  );
  return true;
};

module.exports = {
  handleUnwarnCommand
};
