const { getForwardOriginText, getMessageLinks } = require("../utils/text.js");

const getMessageType = (message) => {
  if (message.text) {
    return "text";
  }

  if (message.photo) {
    return "photo";
  }

  if (message.video) {
    return "video";
  }

  if (message.document) {
    return "document";
  }

  if (message.sticker) {
    return "sticker";
  }

  if (message.animation) {
    return "animation";
  }

  if (message.story) {
    return "story";
  }

  if (message.caption) {
    return "caption";
  }

  return "unknown";
};

const toUserSnapshot = (user) => ({
  id: user.id,
  isBot: user.is_bot,
  firstName: user.first_name,
  lastName: user.last_name,
  username: user.username,
  languageCode: user.language_code
});

const toChatSnapshot = (chat) => ({
  id: chat.id,
  type: chat.type,
  title: chat.title,
  username: chat.username
});

const toBanLog = ({ message, reason, matchedKeyword }) => ({
  chatId: message.chat.id,
  userId: message.from.id,
  messageId: message.message_id,
  chat: toChatSnapshot(message.chat),
  user: toUserSnapshot(message.from),
  text: message.text ?? "",
  caption: message.caption ?? "",
  forwardSource: getForwardOriginText(message),
  links: getMessageLinks(message),
  messageType: getMessageType(message),
  telegramDate: message.date ? new Date(message.date * 1000) : undefined,
  reason,
  matchedKeyword
});

module.exports = {
  toBanLog
};
