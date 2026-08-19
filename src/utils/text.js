// Chuẩn hóa keyword để so khớp ổn định với tiếng Việt và Unicode dựng sẵn.
const normalizeKeyword = (value) => value.normalize("NFC").trim().toLowerCase();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// So khớp nguyên từ/cụm từ, tránh match keyword nằm giữa một từ dài hơn.
const hasKeywordMatch = (text, keyword) => {
  const normalizedText = normalizeKeyword(text);
  const normalizedKeyword = normalizeKeyword(keyword);
  const wordChar = "[\\p{L}\\p{N}\\p{M}_]";
  const pattern = `(?<!${wordChar})${escapeRegExp(normalizedKeyword)}(?!${wordChar})`;

  return new RegExp(pattern, "u").test(normalizedText);
};

const parseKeywords = (value) => [
  ...new Set(
    value
      .split(/[\n,;]+/)
      .map(normalizeKeyword)
      .filter(Boolean)
  )
];

const getMessageText = (message) => message.text ?? message.caption ?? "";

const getEntityText = (text, entity) => {
  if (!text || typeof entity.offset !== "number" || typeof entity.length !== "number") {
    return "";
  }

  return text.slice(entity.offset, entity.offset + entity.length);
};

const getRawLinks = (text) => text?.match(/(?:https?:\/\/|t\.me\/|telegram\.me\/)\S+/gi) ?? [];

const getInlineKeyboardButtons = (message) =>
  message.reply_markup?.inline_keyboard?.flatMap((row) => row) ?? [];

const getReplyMarkupText = (message) =>
  getInlineKeyboardButtons(message)
    .map((button) => button.text)
    .filter(Boolean)
    .join("\n");

const getReplyMarkupLinks = (message) =>
  getInlineKeyboardButtons(message)
    .flatMap((button) => [button.url, button.login_url?.url, button.web_app?.url])
    .filter(Boolean);

const getMessageLinks = (message) => {
  const values = [
    ...getRawLinks(message.text),
    ...getRawLinks(message.caption),
    ...getReplyMarkupLinks(message)
  ];
  const sources = [
    { text: message.text, entities: message.entities },
    { text: message.caption, entities: message.caption_entities }
  ];

  for (const { text, entities = [] } of sources) {
    for (const entity of entities) {
      if (entity.type === "text_link" && entity.url) {
        values.push(entity.url);
      }

      if (entity.type === "url") {
        values.push(getEntityText(text, entity));
      }
    }
  }

  return [...new Set(values.filter(Boolean))];
};

const getForwardOriginText = (message) => {
  const origin = message.forward_origin;
  const values = [
    message.forward_sender_name,
    message.forward_signature,
    message.forward_from?.first_name,
    message.forward_from?.last_name,
    message.forward_from?.username,
    message.forward_from_chat?.title,
    message.forward_from_chat?.username,
    origin?.sender_user?.first_name,
    origin?.sender_user?.last_name,
    origin?.sender_user?.username,
    origin?.sender_chat?.title,
    origin?.sender_chat?.username,
    origin?.chat?.title,
    origin?.chat?.username,
    origin?.author_signature,
    origin?.sender_user_name
  ];

  return values.filter(Boolean).join("\n");
};

const getModerationText = (message) =>
  [
    getMessageText(message),
    getForwardOriginText(message),
    getReplyMarkupText(message),
    ...getMessageLinks(message)
  ]
    .filter(Boolean)
    .join("\n");

const TELEGRAM_BOT_REFERRAL_PATTERN =
  /^(?:https?:\/\/)?(?:t\.me|telegram\.me)\/[a-z0-9_]*bot(?:\?|\/|\b).*?(?:[?&]start=|\/start=)/i;

const REFERRAL_LINK_PATTERN =
  /(?:[?&#/](?:invite|ref|referral|aff)(?:[=_-][a-z0-9][a-z0-9_-]*|\/[a-z0-9][a-z0-9_-]*|$))/i;

// Chặn link referral bot Telegram và link ngoài có mã ref/invite.
const findTelegramBotReferralLink = (message) =>
  getMessageLinks(message).find(
    (link) => TELEGRAM_BOT_REFERRAL_PATTERN.test(link) || REFERRAL_LINK_PATTERN.test(link)
  );

const startsWithCommand = (text, command) => {
  const commandPattern = escapeRegExp(command);
  const pattern = `^${commandPattern}(?:\\s|$)`;
  return new RegExp(pattern).test(text);
};

const isKnownCommand = (text, commands) => {
  return Object.values(commands).some((command) => {
    const commandPattern = escapeRegExp(command);
    const pattern = `^${commandPattern}(?:\\s|$)`;
    return new RegExp(pattern, "i").test(text);
  });
};

const getCommandInput = (text, command) => {
  const commandPattern = escapeRegExp(command);
  const pattern = `^${commandPattern}`;
  return text.replace(new RegExp(pattern), "");
};

const truncate = (value, maxLength = 700) => {
  if (!value) {
    return "";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
};

module.exports = {
  escapeRegExp,
  findTelegramBotReferralLink,
  getForwardOriginText,
  getMessageLinks,
  getMessageText,
  getReplyMarkupText,
  getModerationText,
  getCommandInput,
  hasKeywordMatch,
  isKnownCommand,
  normalizeKeyword,
  parseKeywords,
  startsWithCommand,
  truncate
};
