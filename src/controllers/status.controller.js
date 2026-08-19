const { COMMANDS } = require("../constants/commands.js");
const { replyTargetResolutionError } = require("./id.controller.js");
const { t } = require("../utils/i18n.js");
const { resolveTelegramUserId } = require("../utils/telegram-user.js");
const { getCommandInput, startsWithCommand } = require("../utils/text.js");

const isRestricted = (member) =>
  member?.status === "restricted" || (member?.status === "member" && member?.can_send_messages === false);

const formatStatusLine = (label, value) => `${label}: ${value}`;

const handleStatusCommand = async ({
  language,
  message,
  settings,
  text,
  store,
  identityService,
  isAdmin,
  replyTemporary,
  telegram
}) => {
  const { chat, from, reply_to_message: targetMessage, message_id: messageId } = message;
  const replyOptions = { deleteAfterMs: settings.commandReplyDeleteMs };
  if (!startsWithCommand(text, COMMANDS.status) || !(await isAdmin(chat.id, from.id))) {
    return false;
  }

  const input = getCommandInput(text, COMMANDS.status).trim();
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
    await replyTemporary(chat.id, t(language, "status.usage"), messageId, replyOptions);
    return true;
  }

  let member;
  try {
    member = await telegram.getChatMember(chat.id, targetUserId);
  } catch (error) {
    await replyTemporary(
      chat.id,
      t(language, "common.skipped", { reason: error.message }),
      messageId,
      replyOptions
    );
    return true;
  }

  const pending = await store.getPendingVerificationByUser(chat.id, targetUserId);
  const verificationStatus = await store.getVerificationStatus(chat.id, targetUserId);
  const lines = [t(language, "status.title", { userId: targetUserId })];

  lines.push(
    formatStatusLine(
      t(language, "status.telegramStatus"),
      member.status
    )
  );
  lines.push(
    formatStatusLine(
      t(language, "status.locked"),
      isRestricted(member) ? t(language, "status.yes") : t(language, "status.no")
    )
  );
  lines.push(
    formatStatusLine(
      t(language, "status.banned"),
      member.status === "kicked" || member.status === "left" ? t(language, "status.yes") : t(language, "status.no")
    )
  );
  lines.push(
    formatStatusLine(
      t(language, "status.verification"),
      verificationStatus?.status === "pending"
        ? t(language, "status.pending")
        : verificationStatus?.status === "verified"
          ? t(language, "status.verified")
          : verificationStatus?.status === "expired"
            ? t(language, "status.expired")
            : pending
              ? t(language, "status.pending")
              : t(language, "status.unknown")
    )
  );

  if (verificationStatus?.expiresAt) {
    lines.push(
      formatStatusLine(
        t(language, "status.verificationExpiresAt"),
        new Date(verificationStatus.expiresAt).toLocaleString()
      )
    );
  }

  if (verificationStatus?.attempts !== undefined) {
    lines.push(
      formatStatusLine(t(language, "status.verificationAttempts"), verificationStatus.attempts)
    );
  }

  await replyTemporary(chat.id, lines.join("\n"), messageId, replyOptions);
  return true;
};

module.exports = {
  handleStatusCommand
};
