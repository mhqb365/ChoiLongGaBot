const { COMMANDS } = require("../constants/commands.js");
const { replyTargetResolutionError } = require("./id.controller.js");
const { t } = require("../utils/i18n.js");
const { resolveTelegramUserId } = require("../utils/telegram-user.js");
const { getCommandInput, startsWithCommand } = require("../utils/text.js");

const getValidMessageIds = (messageIds) => messageIds.filter(Boolean);
const LOCK_IMAGE_PATH = "public/lock.png";
const MAX_LOCK_MINUTES = 366 * 24 * 60;
const LOCK_TIME_UNITS = {
  h: 60,
  m: 1
};

const parseLockMinutes = (value) => {
  const match = value.toLowerCase().match(/^(\d+)([mh])?$/);
  if (!match) {
    return null;
  }

  const [, amountValue, unit = "m"] = match;
  const minutes = Number(amountValue) * LOCK_TIME_UNITS[unit];
  return Number.isSafeInteger(minutes) && minutes > 0 && minutes <= MAX_LOCK_MINUTES
    ? minutes
    : null;
};

const getLockUntilDate = (minutes) =>
  minutes ? Math.floor(Date.now() / 1000) + minutes * 60 : undefined;

const parseLockCommandInput = async (input, targetMessage, identityService) => {
  const args = input.split(/\s+/).filter(Boolean);

  if (targetMessage?.from?.id) {
    if (args.length > 1) {
      return null;
    }

    const lockMinutes = args[0] ? parseLockMinutes(args[0]) : null;
    if (args[0] && !lockMinutes) {
      return null;
    }

    return {
      lockMinutes,
      targetUserId: targetMessage.from.id
    };
  }

  if (args.length === 0 || args.length > 2) {
    return null;
  }

  const targetUserId = await resolveTelegramUserId(args[0], identityService);
  const lockMinutes = args[1] ? parseLockMinutes(args[1]) : null;
  if (!targetUserId || (args[1] && !lockMinutes)) {
    return null;
  }

  return {
    lockMinutes,
    targetUserId
  };
};

const handleLockCommand = async ({
  language,
  message,
  settings,
  text,
  store,
  identityService,
  isAdmin,
  restrictUser,
  deleteMessageQuietly,
  replyPhotoTemporary,
  replyTemporary
}) => {
  const { chat, from, reply_to_message: targetMessage, message_id: messageId } = message;
  const replyOptions = { deleteAfterMs: settings.commandReplyDeleteMs };
  if (!startsWithCommand(text, COMMANDS.lock) || !(await isAdmin(chat.id, from.id))) {
    return false;
  }

  const input = getCommandInput(text, COMMANDS.lock).trim();
  let commandInput;
  try {
    commandInput = await parseLockCommandInput(input, targetMessage, identityService);
  } catch (error) {
    await replyTemporary(
      chat.id,
      replyTargetResolutionError(language, error),
      messageId,
      replyOptions
    );
    return true;
  }

  if (!commandInput) {
    await replyTemporary(chat.id, t(language, "lock.usage"), messageId, replyOptions);
    return true;
  }

  const { lockMinutes, targetUserId } = commandInput;
  const pending = await store.getPendingVerificationByUser(chat.id, targetUserId);

  try {
    if (await isAdmin(chat.id, targetUserId)) {
      await replyTemporary(
        chat.id,
        t(language, "common.skipped", {
          reason: t(language, "skipReasons.targetAdmin")
        }),
        messageId,
        replyOptions
      );
      return true;
    }

    await restrictUser(chat.id, targetUserId, { untilDate: getLockUntilDate(lockMinutes) });
    await store.deletePendingVerification(chat.id, targetUserId);
  } catch (error) {
    await replyTemporary(
      chat.id,
      t(language, "common.skipped", { reason: error.message }),
      messageId,
      replyOptions
    );
    return true;
  }

  await Promise.all(
    getValidMessageIds([pending?.messageId, pending?.joinMessageId]).map((pendingMessageId) =>
      deleteMessageQuietly(chat.id, pendingMessageId)
    )
  );

  await replyPhotoTemporary(
    chat.id,
    t(language, lockMinutes ? "lock.doneTemporary" : "lock.done", {
      minutes: lockMinutes,
      userId: targetUserId
    }),
    messageId,
    { ...replyOptions, photoPath: LOCK_IMAGE_PATH }
  );
  return true;
};

module.exports = {
  handleLockCommand
};
