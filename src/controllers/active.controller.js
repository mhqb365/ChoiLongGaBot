const { COMMANDS } = require("../constants/commands.js");
const { t } = require("../utils/i18n.js");
const { startsWithCommand } = require("../utils/text.js");

const handleActiveCommand = async ({
  language,
  message,
  settings,
  text,
  store,
  isAdmin,
  replyTemporary
}) => {
  const { chat, from, message_id: messageId } = message;
  if (!startsWithCommand(text, COMMANDS.active) || !(await isAdmin(chat.id, from.id))) {
    return false;
  }

  await store.ensureChatSettings(chat.id);
  await replyTemporary(chat.id, t(language, "active.done"), messageId, {
    deleteAfterMs: settings.commandReplyDeleteMs
  });
  return true;
};

module.exports = {
  handleActiveCommand
};
