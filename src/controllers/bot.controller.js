const { handleActiveCommand } = require("./active.controller.js");
const { handleBanCommand } = require("./ban.controller.js");
const { handleCleanCommand } = require("./clean.controller.js");
const { handleByeCommand } = require("./bye.controller.js");
const { handleDeactiveCommand } = require("./deactive.controller.js");
const { enforceFilters } = require("./filter.controller.js");
const { handleIdCommand } = require("./id.controller.js");
const { enforceKeywords } = require("./keyword.controller.js");
const { handleLockCommand } = require("./lock.controller.js");
const { handleReportCommand } = require("./report.controller.js");
const { handleServiceMessage } = require("./service-message.controller.js");
const { handleStoryMessage } = require("./story.controller.js");
const { handleSupportCommand } = require("./support.controller.js");
const { handleStatusCommand } = require("./status.controller.js");
const { handleUnbanCommand } = require("./unban.controller.js");
const { handleUnwarnCommand } = require("./unwarn.controller.js");
const { handleUnlockCommand } = require("./unlock.controller.js");
const {
  handleChatMemberVerification,
  handleNewMembersVerification,
  handlePendingVerificationAnswer,
  handleVerificationCallback,
  startVerificationExpiryJob
} = require("./verify.controller.js");
const { handleWarnCommand } = require("./warn.controller.js");
const { COMMANDS } = require("../constants/commands.js");
const { createModerationService } = require("../services/moderation.service.js");
const { createPermissionService } = require("../services/permission.service.js");
const { createReplyService } = require("../services/reply.service.js");
const { normalizeLanguage } = require("../utils/i18n.js");
const { getMessageText, isKnownCommand } = require("../utils/text.js");

const isGroupChat = (chat) => ["group", "supergroup"].includes(chat.type);
const isPrivateChat = (chat) => chat.type === "private";
const PUBLIC_COMMANDS = {
  report: COMMANDS.report
};

// Controller trung tâm: tạo context chung rồi chuyển message qua từng handler theo thứ tự ưu tiên.
const createBotController = ({ identityService, telegram, store }) => {
  const { isAdmin, canModerateUser } = createPermissionService({ telegram });
  const {
    banAndPurge,
    deleteMessageQuietly,
    deleteMessagesQuietly,
    restrictUser,
    unrestrictUser,
    unbanUser
  } = createModerationService({
    telegram,
    canModerateUser
  });
  const { reply, replyPhotoTemporary, replyTemporary } = createReplyService({
    telegram,
    deleteMessageQuietly
  });

  const createControllerContext = (message, text, settings) => ({
    language: settings.language,
    message,
    settings,
    text,
    store,
    identityService,
    telegram,
    isAdmin,
    banAndPurge,
    deleteMessageQuietly,
    deleteMessagesQuietly,
    restrictUser,
    unrestrictUser,
    unbanUser,
    reply,
    replyPhotoTemporary,
    replyTemporary
  });

  const handleMessage = async (message) => {
    if (!message?.chat) {
      return;
    }

    const text = getMessageText(message).trim();
    if (!message.from) {
      return;
    }

    if (isPrivateChat(message.chat)) {
      const privateLanguage = normalizeLanguage(message.from.language_code);
      if (
        await handleIdCommand({
          identityService,
          language: privateLanguage,
          message,
          text,
          reply,
          replyTemporary
        })
      ) {
        return;
      }

      await handleSupportCommand({
        message,
        store,
        telegram,
        text,
        reply
      });
      return;
    }

    if (!isGroupChat(message.chat)) {
      return;
    }

    const isCommand = text && isKnownCommand(text, COMMANDS);
    const isPublicCommand = text && isKnownCommand(text, PUBLIC_COMMANDS);
    const settings = await store.getChatSettings(message.chat.id);
    const context = createControllerContext(message, text, settings);

    if (await handleNewMembersVerification(context)) {
      return;
    }

    if (
      await handlePendingVerificationAnswer({
        language: settings.language,
        message,
        text,
        store,
        unrestrictUser,
        banAndPurge,
        deleteMessageQuietly,
        replyTemporary
      })
    ) {
      return;
    }

    if (isCommand && !isPublicCommand && !(await isAdmin(message.chat.id, message.from.id))) {
      await deleteMessageQuietly(message.chat.id, message.message_id);
      return;
    }

    await store.trackMessage(message);

    if (isCommand && (await handleReportCommand(context))) {
      return;
    }

    if (isCommand && (await handleActiveCommand(context))) {
      return;
    }

    if (isCommand && (await handleDeactiveCommand(context))) {
      return;
    }

    if (isCommand && (await handleCleanCommand(context))) {
      return;
    }

    if (isCommand && (await handleByeCommand(context))) {
      return;
    }

    if (isCommand && (await handleStatusCommand(context))) {
      return;
    }

    if (isCommand && (await handleIdCommand({ ...context, identityService }))) {
      return;
    }

    if (isCommand && (await handleLockCommand(context))) {
      return;
    }

    if (isCommand && (await handleUnlockCommand(context))) {
      return;
    }

    if (await handleStoryMessage(context)) {
      return;
    }

    if (await handleServiceMessage(context)) {
      return;
    }

    if (await enforceFilters(context)) {
      return;
    }

    if (isCommand && (await handleBanCommand(context))) {
      return;
    }

    if (isCommand && (await handleUnbanCommand(context))) {
      return;
    }

    if (isCommand && (await handleWarnCommand(context))) {
      return;
    }

    if (isCommand && (await handleUnwarnCommand(context))) {
      return;
    }

    if (isCommand) {
      await deleteMessageQuietly(message.chat.id, message.message_id);
      return;
    }

    await enforceKeywords(context);
  };

  const stopVerificationExpiryJob = startVerificationExpiryJob({
    store,
    deleteMessageQuietly
  });

  return {
    async handleUpdate(update) {
      if (update.chat_member) {
        await handleChatMemberVerification({
          chatMemberUpdate: update.chat_member,
          store,
          telegram,
          restrictUser
        });
        return;
      }

      if (update.callback_query) {
        await handleVerificationCallback({
          callbackQuery: update.callback_query,
          deleteMessageQuietly,
          store,
          telegram,
          unrestrictUser
        });
        return;
      }

      if (update.message) {
        await handleMessage(update.message);
      }
    },

    stop() {
      stopVerificationExpiryJob();
    }
  };
};

module.exports = {
  createBotController
};
