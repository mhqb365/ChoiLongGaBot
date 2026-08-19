const { getModerationText } = require("../utils/text.js");

const normalize = (value) => value.trim().toLowerCase();

const enforceFilters = async ({ message, store, reply }) => {
  const text = getModerationText(message);
  if (!text) {
    return false;
  }

  const rules = await store.listFilterRules(message.chat.id);
  const matched = rules.find((rule) => text.toLowerCase().includes(normalize(rule.trigger)));
  if (!matched) {
    return false;
  }

  await reply(message.chat.id, matched.replyText, message.message_id);
  return true;
};

module.exports = {
  enforceFilters
};
