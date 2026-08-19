const { isServiceMessage } = require("../utils/service-message.js");

// Xóa service message nếu group đã bật /cleanservice.
const handleServiceMessage = async ({ message, settings, deleteMessageQuietly }) => {
  if (!isServiceMessage(message)) {
    return false;
  }

  if (settings.cleanServiceMessages) {
    await deleteMessageQuietly(message.chat.id, message.message_id);
  }

  return true;
};

module.exports = {
  handleServiceMessage
};
