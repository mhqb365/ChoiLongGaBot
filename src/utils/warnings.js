const WARNING_LIMIT = 2;
const WARNING_REPLY_DELETE_MS = 10_000;

const toWarningMessage = ({ chat, date, messageId, userId }) => ({
  chat,
  date,
  from: { id: userId },
  message_id: messageId
});

module.exports = {
  WARNING_LIMIT,
  WARNING_REPLY_DELETE_MS,
  toWarningMessage
};
