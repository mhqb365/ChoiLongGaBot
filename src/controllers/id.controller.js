const { COMMANDS } = require("../constants/commands.js");
const { escapeHtml } = require("../utils/html.js");
const { t } = require("../utils/i18n.js");
const { getCommandInput, startsWithCommand } = require("../utils/text.js");

const formatUserName = (user) =>
  [user.firstName, user.lastName].filter(Boolean).map(escapeHtml).join(" ");

const formatUserIdResult = (language, user) =>
  t(language, "id.result", {
    id: user.id,
    name: formatUserName(user) || "-",
    username: escapeHtml(user.username)
  });

const getErrorKey = (error) => {
  if (error.code === "identity_unconfigured") {
    return "id.unconfigured";
  }

  if (error.code === "invalid_username") {
    return "id.usage";
  }

  if (error.code === "not_user") {
    return "id.notUser";
  }

  if (error.code === "lookup_failed") {
    return "id.failed";
  }

  return "id.notFound";
};

const replyTargetResolutionError = (language, error) =>
  t(language, getErrorKey(error), { reason: escapeHtml(error.message) });

const handleIdCommand = async ({
  identityService,
  language,
  message,
  settings,
  text,
  reply,
  replyTemporary
}) => {
  const { chat, message_id: messageId } = message;
  if (!startsWithCommand(text, COMMANDS.id)) {
    return false;
  }

  const input = getCommandInput(text, COMMANDS.id).trim();
  const sendReply = (replyText) => {
    if (!settings) {
      return reply(chat.id, replyText, messageId);
    }

    return replyTemporary(chat.id, replyText, messageId, {
      deleteAfterMs: settings.commandReplyDeleteMs
    });
  };

  if (!input) {
    await sendReply(t(language, "id.usage"));
    return true;
  }

  if (!identityService) {
    await sendReply(t(language, "id.unconfigured"));
    return true;
  }

  try {
    const user = await identityService.getUserByUsername(input);
    await sendReply(formatUserIdResult(language, user));
    return true;
  } catch (error) {
    await sendReply(replyTargetResolutionError(language, error));
    return true;
  }
};

module.exports = {
  handleIdCommand,
  replyTargetResolutionError
};
