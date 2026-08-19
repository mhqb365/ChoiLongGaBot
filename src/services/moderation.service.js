const DELETE_BATCH_SIZE = 10;
const MESSAGE_NOT_FOUND_ERROR = "message to delete not found";
const RESTRICTED_CHAT_PERMISSIONS = {
  can_send_messages: false,
  can_send_audios: false,
  can_send_documents: false,
  can_send_photos: false,
  can_send_videos: false,
  can_send_video_notes: false,
  can_send_voice_notes: false,
  can_send_polls: false,
  can_send_other_messages: false,
  can_add_web_page_previews: false,
  can_change_info: false,
  can_invite_users: false,
  can_pin_messages: false,
  can_manage_topics: false
};
const FULL_CHAT_PERMISSIONS = Object.fromEntries(
  Object.keys(RESTRICTED_CHAT_PERMISSIONS).map((permission) => [permission, true])
);

const isMessageNotFoundError = (error) =>
  error.message.toLowerCase().includes(MESSAGE_NOT_FOUND_ERROR);

// Gom các thao tác kiểm duyệt Telegram và nuốt lỗi xóa tin nhắn không còn tồn tại.
const createModerationService = ({ telegram, canModerateUser }) => {
  const deleteMessageQuietly = async (chatId, messageId) => {
    try {
      await telegram.deleteMessage(chatId, messageId);
      return true;
    } catch (error) {
      if (isMessageNotFoundError(error)) {
        return false;
      }

      console.warn(error.message);
      return false;
    }
  };

  const banAndPurge = async (chatId, userId, options = {}) => {
    if (!(await canModerateUser(chatId, userId))) {
      return { skippedReason: "targetAdmin" };
    }

    await telegram.banChatMember(chatId, userId);
    await Promise.all(
      [...new Set(options.messageIds?.filter(Boolean) ?? [])].map((messageId) =>
        deleteMessageQuietly(chatId, messageId)
      )
    );
    return { skippedReason: null };
  };

  const unbanUser = (chatId, userId) => telegram.unbanChatMember(chatId, userId);
  const restrictUser = (chatId, userId, options = {}) =>
    telegram.restrictChatMember(chatId, userId, RESTRICTED_CHAT_PERMISSIONS, options);
  const unrestrictUser = async (chatId, userId) => {
    const chat = await telegram.getChat(chatId);
    return telegram.restrictChatMember(chatId, userId, chat.permissions ?? FULL_CHAT_PERMISSIONS);
  };

  const deleteMessagesQuietly = async (chatId, messageIds) => {
    const uniqueMessageIds = [...new Set(messageIds.filter(Boolean))];
    const results = [];

    // Chia batch nhỏ để tránh dồn quá nhiều request deleteMessage cùng lúc.
    for (let index = 0; index < uniqueMessageIds.length; index += DELETE_BATCH_SIZE) {
      const batch = uniqueMessageIds.slice(index, index + DELETE_BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (messageId) => ({
          messageId,
          deleted: await deleteMessageQuietly(chatId, messageId)
        }))
      );
      results.push(...batchResults);
    }

    return {
      attemptedCount: results.length,
      deletedCount: results.filter((result) => result.deleted).length,
      messageIds: uniqueMessageIds
    };
  };

  return {
    banAndPurge,
    deleteMessageQuietly,
    deleteMessagesQuietly,
    restrictUser,
    unrestrictUser,
    unbanUser
  };
};

module.exports = {
  createModerationService
};
