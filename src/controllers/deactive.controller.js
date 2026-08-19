const { COMMANDS } = require("../constants/commands.js");
const { t } = require("../utils/i18n.js");
const { startsWithCommand } = require("../utils/text.js");

const handleDeactiveCommand = async ({
  language,
  message,
  settings,
  text,
  store,
  isAdmin,
  replyTemporary
}) => {
  const { chat, from, message_id: messageId } = message;
  if (!startsWithCommand(text, COMMANDS.deactive) || !(await isAdmin(chat.id, from.id))) {
    return false;
  }

  await store.deleteChatData(chat.id);
  await replyTemporary(chat.id, t(language, "deactive.done"), messageId, {
    deleteAfterMs: settings.commandReplyDeleteMs
  });
  return true;
};

module.exports = {
  handleDeactiveCommand
};
