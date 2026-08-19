const AUTO_DELETE_COMMAND_MS = 3_000;
const BAN_IMAGE_PATH = "public/ban.png";

// Gửi phản hồi HTML và có thể tự xóa cả lệnh lẫn phản hồi sau timeout.
const createReplyService = ({ telegram, deleteMessageQuietly }) => {
  const reply = (chatId, text, replyToMessageId) =>
    telegram.sendMessage({
      chat_id: chatId,
      parse_mode: "HTML",
      text,
      reply_parameters: replyToMessageId
        ? { message_id: replyToMessageId, allow_sending_without_reply: true }
        : undefined
    });

  const replyPhoto = (chatId, text, replyToMessageId, photoPath = BAN_IMAGE_PATH) =>
    telegram.sendPhoto({
      caption: text,
      chat_id: chatId,
      parse_mode: "HTML",
      photo: photoPath,
      reply_parameters: replyToMessageId
        ? { message_id: replyToMessageId, allow_sending_without_reply: true }
        : undefined
    });

  const replyTemporary = async (chatId, text, commandMessageId, options = {}) => {
    const sentMessage = await reply(chatId, text, commandMessageId);
    const { deleteAfterMs = AUTO_DELETE_COMMAND_MS, deleteCommand = true } = options;

    const timer = setTimeout(() => {
      if (deleteCommand) {
        deleteMessageQuietly(chatId, commandMessageId);
      }

      deleteMessageQuietly(chatId, sentMessage.message_id);
    }, deleteAfterMs);
    timer.unref?.();

    return sentMessage;
  };

  const replyPhotoTemporary = async (chatId, text, commandMessageId, options = {}) => {
    const sentMessage = await replyPhoto(chatId, text, commandMessageId, options.photoPath);
    const { deleteAfterMs = AUTO_DELETE_COMMAND_MS, deleteCommand = true } = options;

    const timer = setTimeout(() => {
      if (deleteCommand) {
        deleteMessageQuietly(chatId, commandMessageId);
      }

      deleteMessageQuietly(chatId, sentMessage.message_id);
    }, deleteAfterMs);
    timer.unref?.();

    return sentMessage;
  };

  return {
    reply,
    replyPhoto,
    replyPhotoTemporary,
    replyTemporary
  };
};

module.exports = {
  createReplyService
};
