const { escapeHtml } = require("../utils/html.js");
const { t } = require("../utils/i18n.js");
const {
  getForwardOriginText,
  getMessageLinks,
  getMessageText,
  truncate
} = require("../utils/text.js");
const { formatUserLine } = require("../utils/user.js");

// Rút gọn message Telegram thành dữ liệu đủ để báo cáo moderation.
const toReportMessage = (message) => ({
  user: {
    id: message.from.id,
    firstName: message.from.first_name,
    lastName: message.from.last_name,
    username: message.from.username
  },
  text: message.text ?? "",
  caption: message.caption ?? "",
  forwardSource: getForwardOriginText(message),
  links: getMessageLinks(message)
});

// Định dạng báo cáo gửi lại group sau khi bot ban/xóa vì vi phạm.
const formatModerationReport = ({
  contentMaxLength = 700,
  language,
  reason,
  targetMessage,
  matchedKeyword
}) => {
  const content = escapeHtml(
    truncate(
      getMessageText(targetMessage) || t(language, "report.nonTextMessage"),
      contentMaxLength
    )
  );
  const matched = matchedKeyword
    ? t(language, "report.matched", {
        value: escapeHtml(truncate(matchedKeyword, 160))
      })
    : null;
  const forwardSource = targetMessage.forwardSource
    ? t(language, "report.forwardSource", {
        value: escapeHtml(truncate(targetMessage.forwardSource, 160))
      })
    : null;
  const links = targetMessage.links?.length
    ? t(language, "report.links", {
        value: escapeHtml(truncate(targetMessage.links.join("\n"), 240))
      })
    : null;
  const lines = [
    t(language, "report.title"),
    t(language, "report.user", { user: escapeHtml(formatUserLine(targetMessage?.user)) }),
    t(language, "report.reason", { reason: escapeHtml(reason) }),
    matched,
    forwardSource,
    links,
    "",
    t(language, "report.contentTitle"),
    content
  ];

  return lines.filter((line) => line !== null).join("\n");
};

module.exports = {
  formatModerationReport,
  toReportMessage
};
