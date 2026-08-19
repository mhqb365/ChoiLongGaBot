const { formatModerationReport, toReportMessage } = require("../services/report.service.js");
const { t } = require("../utils/i18n.js");
const {
  findTelegramBotReferralLink,
  getModerationText,
  hasKeywordMatch
} = require("../utils/text.js");
const { WARNING_LIMIT, WARNING_REPLY_DELETE_MS } = require("../utils/warnings.js");

// Kiểm duyệt nội dung thường: keyword cấm ưu tiên trước link referral bot.
const enforceKeywords = async ({
  language,
  message,
  settings,
  store,
  isAdmin,
  banAndPurge,
  deleteMessageQuietly,
  replyTemporary
}) => {
  const { chat, from } = message;
  const moderationText = getModerationText(message);
  const keywords = await store.listKeywords(chat.id);
  const matched = keywords.find((row) => hasKeywordMatch(moderationText, row.keyword));
  const blockedLink = matched ? null : findTelegramBotReferralLink(message);

  if (!matched && !blockedLink) {
    return;
  }

  if (blockedLink && !settings.cleanLinkMessages && !settings.banLinkSenders) {
    return;
  }

  if (matched) {
    if (await isAdmin(chat.id, from.id)) {
      console.log(`Skipped ${from.id} in ${chat.id} for keyword "${matched.keyword}": targetAdmin`);
      return;
    }

    const warning = await store.incrementWarning(chat.id, from.id, {
      reason: "keyword match",
      matchedKeyword: matched.keyword
    });
    if (warning.count <= WARNING_LIMIT) {
      await replyTemporary(
        chat.id,
        t(language, "blocklist.warning", {
          count: warning.count,
          max: WARNING_LIMIT
        }),
        message.message_id,
        {
          deleteAfterMs: WARNING_REPLY_DELETE_MS,
          deleteCommand: false
        }
      );
      await deleteMessageQuietly(chat.id, message.message_id);
      console.log(
        `Warned ${from.id} in ${chat.id} for keyword "${matched.keyword}" (${warning.count}/${WARNING_LIMIT})`
      );
      return;
    }
  }

  if (blockedLink && !settings.banLinkSenders) {
    await deleteMessageQuietly(chat.id, message.message_id);
    return;
  }

  // Không ban admin/creator; service moderation sẽ trả skippedReason nếu target được bảo vệ.
  const { skippedReason } = await banAndPurge(chat.id, from.id, {
    messageIds: [message.message_id]
  });
  if (skippedReason) {
    console.log(
      `Skipped ${from.id} in ${chat.id} for ${
        matched ? `keyword "${matched.keyword}"` : `link "${blockedLink}"`
      }: ${skippedReason}`
    );
    return;
  }

  const reason = matched ? "keyword match" : "telegram bot referral link";
  const matchedKeyword = matched?.keyword ?? blockedLink;

  console.log(`Banned ${from.id} in ${chat.id} for ${reason}: "${matchedKeyword}"`);

  if (matched) {
    await store.clearWarnings(chat.id, from.id);
  }

  await store.recordBanLog({
    message,
    reason,
    matchedKeyword
  });

  const report = formatModerationReport({
    language,
    reason: matched
      ? t(language, "reasons.keywordMatch")
      : t(language, "reasons.telegramBotReferralLink"),
    matchedKeyword: matched ? null : matchedKeyword,
    targetMessage: toReportMessage(message)
  });
  await replyTemporary(chat.id, report, message.message_id);
};

module.exports = {
  enforceKeywords
};
