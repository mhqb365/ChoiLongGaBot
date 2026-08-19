const { COMMANDS } = require("../constants/commands.js");
const { toReportMessage } = require("../services/report.service.js");
const { escapeHtml } = require("../utils/html.js");
const { t } = require("../utils/i18n.js");
const { getMessageText, startsWithCommand, truncate } = require("../utils/text.js");
const { formatUserLine } = require("../utils/user.js");

const formatUserReport = ({ language, targetMessage }) => {
  const reportMessage = toReportMessage(targetMessage);
  const content = escapeHtml(
    truncate(getMessageText(reportMessage) || t(language, "report.nonTextMessage"))
  );
  const lines = [
    t(language, "userReport.title"),
    t(language, "userReport.target", { user: escapeHtml(formatUserLine(reportMessage.user)) }),
    "",
    t(language, "report.contentTitle"),
    content
  ];

  return lines.filter((line) => line !== null).join("\n");
};

const handleReportCommand = async ({
  language,
  message,
  settings,
  text,
  deleteMessageQuietly,
  reply,
  replyTemporary
}) => {
  const { chat, reply_to_message: targetMessage, message_id: messageId } = message;
  if (!startsWithCommand(text, COMMANDS.report)) {
    return false;
  }

  if (!targetMessage?.from?.id) {
    await replyTemporary(chat.id, t(language, "userReport.usage"), messageId, {
      deleteAfterMs: settings.commandReplyDeleteMs
    });
    return true;
  }

  const report = formatUserReport({
    language,
    targetMessage
  });

  await reply(chat.id, report, targetMessage.message_id);
  await deleteMessageQuietly(chat.id, messageId);
  return true;
};

module.exports = {
  handleReportCommand
};
