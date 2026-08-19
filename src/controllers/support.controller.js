const { COMMANDS } = require("../constants/commands.js");
const { DEFAULT_LANGUAGE, normalizeLanguage, t } = require("../utils/i18n.js");
const { escapeRegExp, getCommandInput, startsWithCommand } = require("../utils/text.js");

const MATCH_LIMIT = 5;
const SUPPORT_LIMIT_PER_DAY = 2;
const SUPPORT_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

const normalizeSearchText = (value) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();

const toGroupLine = (chat) => {
  return {
    chatId: chat.id,
    title: chat.title,
    username: chat.username,
    type: chat.type
  };
};

const createGroupSearchPattern = (query) => {
  const tokens = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return null;
  }

  return new RegExp(tokens.map(escapeRegExp).join(".*"), "i");
};

const findMatchingGroups = async ({ groupQuery, store, telegram }) => {
  const pattern = createGroupSearchPattern(groupQuery);
  if (!pattern) {
    return [];
  }

  const chatIds = await store.listConfiguredChatIds();
  const chats = await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        return await telegram.getChat(chatId);
      } catch {
        return null;
      }
    })
  );

  return chats
    .filter(Boolean)
    .filter((chat) =>
      pattern.test(
        normalizeSearchText([chat.title, chat.username, String(chat.id)].filter(Boolean).join(" "))
      )
    )
    .slice(0, MATCH_LIMIT);
};

const toRequester = (user) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  username: user.username,
  languageCode: user.language_code
});

const parseSupportLanguage = (value) => {
  const normalizedValue = value.trim().toLowerCase();
  if (["vi", "vn", "tieng viet", "tiếng việt", "vietnamese"].includes(normalizedValue)) {
    return "vi";
  }

  if (["en", "eng", "english"].includes(normalizedValue)) {
    return "en";
  }

  return null;
};

const handleLanguageStep = async ({ chatId, languageInput, message, store, reply }) => {
  const selectedLanguage = parseSupportLanguage(languageInput);
  if (!selectedLanguage) {
    await store.saveSupportSession(message.from.id, {
      language: DEFAULT_LANGUAGE,
      step: "language"
    });
    await reply(chatId, t(DEFAULT_LANGUAGE, "support.askLanguage"));
    return true;
  }

  await store.saveSupportSession(message.from.id, {
    language: selectedLanguage,
    step: "group"
  });
  await reply(chatId, t(selectedLanguage, "support.askGroup"));
  return true;
};

const handleGroupStep = async ({
  chatId,
  groupQuery,
  language,
  message,
  store,
  telegram,
  reply
}) => {
  if (!groupQuery) {
    await store.saveSupportSession(message.from.id, { language, step: "group" });
    await reply(chatId, t(language, "support.askGroup"));
    return true;
  }

  const groupMatches = await findMatchingGroups({
    groupQuery,
    store,
    telegram
  });

  if (groupMatches.length === 0) {
    await store.saveSupportSession(message.from.id, { language, step: "group" });
    await reply(chatId, t(language, "support.groupNotFound"));
    return true;
  }

  const matchedChats = groupMatches.map(toGroupLine);
  await store.saveSupportSession(message.from.id, {
    groupQuery,
    language,
    matchedChats,
    step: "details"
  });
  await reply(chatId, t(language, "support.askDetails"));
  return true;
};

const handleDetailsStep = async ({ chatId, details, language, message, session, store, reply }) => {
  if (!details) {
    await reply(chatId, t(language, "support.askDetails"));
    return true;
  }

  const moderationContext = await store.getSupportModerationContext(
    session.matchedChats.map((matchedChat) => matchedChat.chatId),
    message.from.id
  );

  await store.recordSupportRequest({
    requester: toRequester(message.from),
    groupQuery: session.groupQuery,
    details,
    language,
    matchedChats: session.matchedChats,
    moderationContext
  });
  await store.deleteSupportSession(message.from.id);
  await reply(chatId, t(language, "support.sent"));
  return true;
};

const handleSupportCommand = async ({ message, store, telegram, text, reply }) => {
  const { chat } = message;
  const isSupportCommand = startsWithCommand(text, COMMANDS.support);
  const session = await store.getSupportSession(message.from.id);
  if (!isSupportCommand && !session) {
    return false;
  }

  if (isSupportCommand) {
    const recentRequestCount = await store.countRecentSupportRequests(
      message.from.id,
      new Date(Date.now() - SUPPORT_LIMIT_WINDOW_MS)
    );
    if (recentRequestCount >= SUPPORT_LIMIT_PER_DAY) {
      await store.deleteSupportSession(message.from.id);
      await reply(
        chat.id,
        t(DEFAULT_LANGUAGE, "support.rateLimited", {
          limit: SUPPORT_LIMIT_PER_DAY
        })
      );
      return true;
    }

    const languageInput = getCommandInput(text, COMMANDS.support).trim();
    return handleLanguageStep({
      chatId: chat.id,
      languageInput,
      message,
      store,
      reply
    });
  }

  if (session.step === "language") {
    return handleLanguageStep({
      chatId: chat.id,
      languageInput: text,
      message,
      store,
      reply
    });
  }

  const language = normalizeLanguage(session.language);

  if (session.step === "group") {
    return handleGroupStep({
      chatId: chat.id,
      groupQuery: text.trim(),
      language,
      message,
      store,
      telegram,
      reply
    });
  }

  return handleDetailsStep({
    chatId: chat.id,
    details: text.trim(),
    language,
    message,
    session,
    store,
    reply
  });
};

module.exports = {
  handleSupportCommand
};
