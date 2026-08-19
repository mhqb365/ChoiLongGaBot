const { randomBytes } = require("node:crypto");

const { escapeHtml } = require("../utils/html.js");
const { t } = require("../utils/i18n.js");
const { getDisplayName } = require("../utils/user.js");

const VERIFY_CALLBACK_PREFIX = "verify";
const VERIFY_JOB_INTERVAL_MS = 30_000;
const VERIFY_MAX_ATTEMPTS = 3;

const createToken = () => randomBytes(8).toString("hex");

const JOINED_MEMBER_STATUSES = ["member", "restricted"];
const LEFT_MEMBER_STATUSES = ["left", "kicked"];
const getValidMessageIds = (messageIds) => messageIds.filter(Boolean);

const parseCallbackData = (data) => {
  const [prefix, chatId, userId, token] = data.split(":");
  if (prefix !== VERIFY_CALLBACK_PREFIX || !chatId || !userId || !token) {
    return null;
  }

  return {
    chatId: Number(chatId),
    userId: Number(userId),
    token
  };
};

const createVerificationChallenge = async ({
  chat,
  joinMessageId = null,
  language,
  store,
  telegram,
  timeoutMs,
  restrictUser,
  user
}) => {
  if (user.is_bot) {
    return;
  }

  const pending = await store.getPendingVerificationByUser(chat.id, user.id);
  if (pending) {
    return;
  }

  const token = createToken();
  await restrictUser(chat.id, user.id);
  const sentMessage = await telegram.sendMessage({
    chat_id: chat.id,
    parse_mode: "HTML",
    text: t(language, "verify.challenge", {
      name: escapeHtml(getDisplayName(user))
    }),
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: t(language, "verify.button"),
            callback_data: `${VERIFY_CALLBACK_PREFIX}:${chat.id}:${user.id}:${token}`
          }
        ]
      ]
    }
  });

  await store.savePendingVerification({
    chatId: chat.id,
    userId: user.id,
    token,
    answer: token,
    attempts: 0,
    messageId: sentMessage.message_id,
    joinMessageId,
    expiresAt: new Date(Date.now() + timeoutMs)
  });
};

const handleNewMembersVerification = async ({
  language,
  message,
  settings,
  store,
  telegram,
  restrictUser,
  deleteMessageQuietly
}) => {
  if (!settings.memberVerificationEnabled || !message.new_chat_members?.length) {
    return false;
  }

  const { chat, message_id: joinMessageId } = message;
  for (const user of message.new_chat_members) {
    await createVerificationChallenge({
      chat,
      joinMessageId,
      language,
      store,
      telegram,
      timeoutMs: settings.memberVerificationTimeoutMs,
      restrictUser,
      user
    });
  }

  await deleteMessageQuietly(chat.id, joinMessageId);
  return true;
};

const didUserJoinChat = (chatMemberUpdate) =>
  LEFT_MEMBER_STATUSES.includes(chatMemberUpdate.old_chat_member?.status) &&
  JOINED_MEMBER_STATUSES.includes(chatMemberUpdate.new_chat_member?.status);

const handleChatMemberVerification = async ({
  chatMemberUpdate,
  store,
  telegram,
  restrictUser
}) => {
  const { chat, new_chat_member: newChatMember } = chatMemberUpdate;
  if (!chat?.id || !newChatMember?.user || !didUserJoinChat(chatMemberUpdate)) {
    return false;
  }

  const settings = await store.getChatSettings(chat.id);
  if (!settings.memberVerificationEnabled) {
    return false;
  }

  await createVerificationChallenge({
    chat,
    language: settings.language,
    store,
    telegram,
    timeoutMs: settings.memberVerificationTimeoutMs,
    restrictUser,
    user: newChatMember.user
  });
  return true;
};

const handlePendingVerificationAnswer = async ({
  language,
  message,
  text,
  store,
  unrestrictUser,
  banAndPurge,
  deleteMessageQuietly,
  replyTemporary
}) => {
  const pending = await store.getPendingVerificationByUser(message.chat.id, message.from.id);
  if (!pending) {
    return false;
  }

  const messageIds = getValidMessageIds([
    pending.messageId,
    pending.joinMessageId,
    message.message_id
  ]);
  if (text === pending.answer) {
    await unrestrictUser(message.chat.id, message.from.id);
    await store.setVerificationStatus(message.chat.id, message.from.id, "verified", {
      attempts: pending.attempts,
      updatedBy: "user"
    });
    await store.deletePendingVerification(message.chat.id, message.from.id);
    await replyTemporary(
      message.chat.id,
      t(language, "verify.verified", {
        name: escapeHtml(getDisplayName(message.from))
      }),
      message.message_id,
      { deleteAfterMs: 5_000, deleteCommand: false }
    );
    await Promise.all(
      messageIds.map((messageId) => deleteMessageQuietly(message.chat.id, messageId))
    );
    return true;
  }

  const updatedPending = await store.incrementPendingVerificationAttempts(
    message.chat.id,
    message.from.id
  );

  if ((updatedPending?.attempts ?? VERIFY_MAX_ATTEMPTS) >= VERIFY_MAX_ATTEMPTS) {
    await store.setVerificationStatus(message.chat.id, message.from.id, "expired", {
      attempts: updatedPending?.attempts ?? VERIFY_MAX_ATTEMPTS,
      updatedBy: "system"
    });
    await banAndPurge(message.chat.id, message.from.id, { messageIds });
    await store.deletePendingVerification(message.chat.id, message.from.id);
    return true;
  }

  const remainingAttempts = VERIFY_MAX_ATTEMPTS - updatedPending.attempts;
  await replyTemporary(
    message.chat.id,
    t(language, remainingAttempts === 1 ? "verify.wrongLastChance" : "verify.wrongAnswer", {
      remaining: remainingAttempts
    }),
    message.message_id,
    { deleteAfterMs: 5_000 }
  );
  await deleteMessageQuietly(message.chat.id, message.message_id);
  return true;
};

const handleVerificationCallback = async ({
  callbackQuery,
  store,
  telegram,
  unrestrictUser,
  deleteMessageQuietly
}) => {
  const parsed = parseCallbackData(callbackQuery.data ?? "");
  if (!parsed) {
    return false;
  }

  const settings = await store.getChatSettings(parsed.chatId);
  if (callbackQuery.from.id !== parsed.userId) {
    await telegram.answerCallbackQuery(
      callbackQuery.id,
      t(settings.language, "verify.notForYou"),
      true
    );
    return true;
  }

  const pending = await store.getPendingVerification(parsed.chatId, parsed.userId, parsed.token);
  if (!pending) {
    await telegram.answerCallbackQuery(
      callbackQuery.id,
      t(settings.language, "verify.expired"),
      true
    );
    return true;
  }

  await unrestrictUser(parsed.chatId, parsed.userId);
  await store.deletePendingVerification(parsed.chatId, parsed.userId);
  await telegram.answerCallbackQuery(
    callbackQuery.id,
    t(settings.language, "verify.verifiedCallback"),
    true
  );
  await Promise.all(
    getValidMessageIds([pending.messageId, pending.joinMessageId]).map((messageId) =>
      deleteMessageQuietly(parsed.chatId, messageId)
    )
  );
  return true;
};

const startVerificationExpiryJob = ({ store, deleteMessageQuietly }) => {
  const run = async () => {
  const pendingRows = await store.listExpiredPendingVerifications(new Date());

    for (const pending of pendingRows) {
      await store.setVerificationStatus(pending.chatId, pending.userId, "expired", {
        attempts: pending.attempts ?? 0,
        expiresAt: pending.expiresAt,
        updatedBy: "system"
      });
      await store.deletePendingVerification(pending.chatId, pending.userId);
      await Promise.all(
        getValidMessageIds([pending.messageId, pending.joinMessageId]).map((messageId) =>
          deleteMessageQuietly(pending.chatId, messageId)
        )
      );
    }
  };

  const timer = setInterval(() => {
    run().catch((error) => console.warn(error.message));
  }, VERIFY_JOB_INTERVAL_MS);
  timer.unref?.();
  run().catch((error) => console.warn(error.message));

  return () => clearInterval(timer);
};

module.exports = {
  handleNewMembersVerification,
  handleChatMemberVerification,
  handlePendingVerificationAnswer,
  handleVerificationCallback,
  startVerificationExpiryJob
};
