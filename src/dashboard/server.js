const fs = require("node:fs/promises");
const crypto = require("node:crypto");
const http = require("node:http");
const path = require("node:path");

const { COMMAND_GUIDE } = require("../constants/commands.js");
const { escapeHtml } = require("../utils/html.js");
const { normalizeLanguage, t } = require("../utils/i18n.js");
const { parseKeywords } = require("../utils/text.js");
const { validateTelegramInitData } = require("./auth.js");

const PUBLIC_DIR = path.join(__dirname, "..", "..", "public", "dashboard");
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
};

const sendText = (response, statusCode, text) => {
  response.writeHead(statusCode, { "content-type": "text/plain; charset=utf-8" });
  response.end(text);
};

const readJsonBody = async (request) => {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
};

const parseChatId = (value) => {
  const chatId = Number(value);
  return Number.isSafeInteger(chatId) ? chatId : null;
};

const toSupportRequest = (request) => ({
  id: String(request._id),
  requester: request.requester,
  groupQuery: request.groupQuery,
  details: request.details,
  language: request.language,
  matchedChats: request.matchedChats,
  moderationContext: request.moderationContext ?? [],
  status: request.status ?? "pending",
  resolutionAction: request.resolutionAction ?? "",
  resolvedAt: request.resolvedAt,
  resolutionMessage: request.resolutionMessage ?? "",
  createdAt: request.createdAt
});

const FULL_CHAT_PERMISSIONS = {
  can_send_messages: true,
  can_send_audios: true,
  can_send_documents: true,
  can_send_photos: true,
  can_send_videos: true,
  can_send_video_notes: true,
  can_send_voice_notes: true,
  can_send_polls: true,
  can_send_other_messages: true,
  can_add_web_page_previews: true,
  can_change_info: true,
  can_invite_users: true,
  can_pin_messages: true,
  can_manage_topics: true
};

const SUPPORT_ACTIONS = new Set(["unlock", "unban", "ignore"]);
const ADMIN_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const adminSessions = new Map();

const createAdminSession = (user) => {
  const token = crypto.randomBytes(32).toString("hex");
  adminSessions.set(token, {
    expiresAt: Date.now() + ADMIN_SESSION_TTL_MS,
    user
  });
  return token;
};

const validateAdminSession = (token) => {
  if (!token) {
    return null;
  }

  const session = adminSessions.get(token);
  if (!session) {
    return null;
  }

  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    return null;
  }

  return session.user;
};

const isWebAdmin = (user) => user?.role === "admin" || user?.isWebAdmin === true;

const getDashboardState = async ({ chat, chatId, store }) => {
  const [
    settings,
    keywordCount,
    filterCount,
    bannedUserCount,
    unbannedUserCount,
    keywords,
    filters,
    supportRequests
  ] =
    await Promise.all([
      store.getChatSettings(chatId),
      store.countKeywords(chatId),
      store.countFilterRules(chatId),
      store.countBannedUsers(chatId),
      store.countUnbannedUsers(chatId),
      store.listKeywords(chatId),
      store.listFilterRules(chatId),
      store.listSupportRequests(chatId)
    ]);

  return {
    chat: {
      id: chatId,
      title: chat.title ?? String(chatId),
      type: chat.type
    },
    settings,
    commands: COMMAND_GUIDE,
    stats: {
      keywordCount,
      filterCount,
      bannedUserCount,
      unbannedUserCount
    },
    keywords: keywords.map((row) => row.keyword),
    filters: filters.map((row) => ({
      trigger: row.trigger,
      replyText: row.replyText
    })),
    supportRequests: supportRequests.map(toSupportRequest)
  };
};

const getRequestUser = (request, botToken) => {
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const sessionUser = validateAdminSession(authHeader.slice(7).trim());
    if (sessionUser) {
      return sessionUser;
    }
  }

  const initData = request.headers["x-telegram-init-data"];
  if (!initData) {
    return null;
  }

  return validateTelegramInitData(initData, botToken);
};

const getAuthenticatedUser = ({ botToken, request }) => {
  const user = getRequestUser(request, botToken);
  if (!user?.id && !isWebAdmin(user)) {
    return {
      error: {
        status: 401,
        message: "Admin login or Telegram Mini App session is required."
      }
    };
  }

  return { user };
};

const isAdminStatus = (status) => ["creator", "administrator"].includes(status);

const authorizeChatAdmin = async ({ botToken, chatId, request, telegram }) => {
  const { error, user } = getAuthenticatedUser({ botToken, request });
  if (error) {
    return { error };
  }

  try {
    if (isWebAdmin(user)) {
      const chat = await telegram.getChat(chatId);
      return { chat, user };
    }

    const [chat, member] = await Promise.all([
      telegram.getChat(chatId),
      telegram.getChatMember(chatId, user.id)
    ]);
    if (!isAdminStatus(member.status)) {
      return { error: { status: 403, message: "Only group admins can manage this chat." } };
    }

    return { chat, user };
  } catch {
    return { error: { status: 404, message: "Chat not found or bot cannot access it." } };
  }
};

const listAdminChats = async ({ botToken, request, store, telegram }) => {
  const { error, user } = getAuthenticatedUser({ botToken, request });
  if (error) {
    return { error };
  }

  const chatIds = await store.listConfiguredChatIds();
  const chats = await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        if (isWebAdmin(user)) {
          const chat = await telegram.getChat(chatId);
          return {
            id: chatId,
            title: chat.title ?? String(chatId),
            type: chat.type
          };
        }

        const [chat, member] = await Promise.all([
          telegram.getChat(chatId),
          telegram.getChatMember(chatId, user.id)
        ]);
        if (!isAdminStatus(member.status)) {
          return null;
        }

        return {
          id: chatId,
          title: chat.title ?? String(chatId),
          type: chat.type
        };
      } catch {
        return null;
      }
    })
  );

  return { chats: chats.filter(Boolean) };
};

const updateSettings = async ({ chatId, store, updates }) => {
  if (updates.banLinkSenders === true) {
    updates.cleanLinkMessages = false;
  } else if (updates.cleanLinkMessages === true) {
    updates.banLinkSenders = false;
  }

  if (updates.banStorySenders === true) {
    updates.cleanStoryMessages = false;
  } else if (updates.cleanStoryMessages === true) {
    updates.banStorySenders = false;
  }

  if (typeof updates.language === "string" && ["vi", "en"].includes(updates.language)) {
    await store.setLanguage(chatId, updates.language);
  }

  if (typeof updates.cleanServiceMessages === "boolean") {
    await store.setCleanServiceMessages(chatId, updates.cleanServiceMessages);
  }

  if (typeof updates.cleanLinkMessages === "boolean") {
    await store.setCleanLinkMessages(chatId, updates.cleanLinkMessages);
  }

  if (typeof updates.banLinkSenders === "boolean") {
    await store.setBanLinkSenders(chatId, updates.banLinkSenders);
  }

  if (typeof updates.cleanStoryMessages === "boolean") {
    await store.setCleanStoryMessages(chatId, updates.cleanStoryMessages);
  }

  if (typeof updates.banStorySenders === "boolean") {
    await store.setBanStorySenders(chatId, updates.banStorySenders);
  }

  if (typeof updates.memberVerificationEnabled === "boolean") {
    await store.setMemberVerificationEnabled(chatId, updates.memberVerificationEnabled);
  }

  if (Number.isInteger(updates.memberVerificationTimeoutMinutes)) {
    const minutes = Math.min(Math.max(updates.memberVerificationTimeoutMinutes, 1), 60);
    await store.setMemberVerificationTimeoutMinutes(chatId, minutes);
  }

  if (Number.isInteger(updates.commandReplyDeleteSeconds)) {
    const seconds = Math.min(Math.max(updates.commandReplyDeleteSeconds, 1), 60);
    await store.setCommandReplyDeleteSeconds(chatId, seconds);
  }
};

const getChatTitle = (chat) => chat.title ?? chat.username ?? String(chat.id);

const getChatJoinLink = (chat) => {
  if (chat.username) {
    return `https://t.me/${chat.username}`;
  }

  return chat.invite_link ?? "";
};

const getSupportResolutionText = ({ action, chat, language }) => {
  const link = action === "unban" ? getChatJoinLink(chat) : "";
  const key =
    action === "unban" && link ? "supportResolution.unbanWithLink" : `supportResolution.${action}`;

  return t(language, key, {
    group: escapeHtml(getChatTitle(chat)),
    link: escapeHtml(link)
  });
};

const notifySupportRequester = async ({ action, chat, request, telegram }) => {
  const language = normalizeLanguage(request.language);
  await telegram.sendMessage({
    chat_id: request.requester.id,
    parse_mode: "HTML",
    text: getSupportResolutionText({ action, chat, language })
  });
};

const handleSupportAction = async ({ action, chat, chatId, requestId, store, telegram, user }) => {
  if (!SUPPORT_ACTIONS.has(action)) {
    return { error: { status: 400, message: "Valid support action is required." } };
  }

  const supportRequest = await store.getSupportRequestForChat(requestId, chatId);
  if (!supportRequest) {
    return { error: { status: 404, message: "Support request not found." } };
  }

  if ((supportRequest.status ?? "pending") !== "pending") {
    return { error: { status: 409, message: "Support request has already been resolved." } };
  }

  const requesterId = supportRequest.requester.id;
  if (action === "unlock") {
    const currentChat = await telegram.getChat(chatId);
    await telegram.restrictChatMember(
      chatId,
      requesterId,
      currentChat.permissions ?? FULL_CHAT_PERMISSIONS
    );
    await store.deletePendingVerification(chatId, requesterId);
  } else if (action === "unban") {
    await telegram.unbanChatMember(chatId, requesterId);
    await store.recordUnbanLog({
      adminUserId: user.id ?? 0,
      chatId,
      reason: "support request",
      source: "support",
      supportRequestId: requestId,
      userId: requesterId
    });
  }

  await notifySupportRequester({
    action,
    chat,
    request: supportRequest,
    telegram
  });

  await store.resolveSupportRequest(requestId, chatId, {
    action,
    resolvedBy: user.id ?? 0,
    message: getSupportResolutionText({
      action,
      chat,
      language: normalizeLanguage(supportRequest.language)
    })
  });

  return { error: null };
};

const handleLoginRequest = async ({ adminPassword, adminUsername, request, response }) => {
  if (!adminUsername || !adminPassword) {
    sendJson(response, 503, { error: "Admin password login is not configured." });
    return;
  }

  const body = await readJsonBody(request);
  if (body.username !== adminUsername || body.password !== adminPassword) {
    sendJson(response, 401, { error: "Invalid admin username or password." });
    return;
  }

  const user = { username: adminUsername, role: "admin", isWebAdmin: true };
  sendJson(response, 200, {
    token: createAdminSession(user),
    user
  });
};

const handleApiRequest = async ({
  adminPassword,
  adminUsername,
  botToken,
  request,
  response,
  store,
  telegram,
  url
}) => {
  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    await handleLoginRequest({ adminPassword, adminUsername, request, response });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/chats") {
    const { chats, error } = await listAdminChats({
      botToken,
      request,
      store,
      telegram
    });
    if (error) {
      sendJson(response, error.status, { error: error.message });
      return;
    }

    sendJson(response, 200, { chats });
    return;
  }

  const chatId = parseChatId(url.searchParams.get("chatId"));
  if (!chatId) {
    sendJson(response, 400, { error: "Valid chatId is required." });
    return;
  }

  const { chat, error, user } = await authorizeChatAdmin({
    botToken,
    chatId,
    request,
    telegram
  });
  if (error) {
    sendJson(response, error.status, { error: error.message });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/dashboard") {
    sendJson(response, 200, await getDashboardState({ chat, chatId, store }));
    return;
  }

  if (request.method === "PATCH" && url.pathname === "/api/settings") {
    const body = await readJsonBody(request);
    await updateSettings({ chatId, store, updates: body.updates ?? {} });
    sendJson(response, 200, await getDashboardState({ chat, chatId, store }));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/support-requests") {
    const body = await readJsonBody(request);
    const { error: actionError } = await handleSupportAction({
      action: body.action,
      chat,
      chatId,
      requestId: body.requestId,
      store,
      telegram,
      user
    });
    if (actionError) {
      sendJson(response, actionError.status, { error: actionError.message });
      return;
    }

    sendJson(response, 200, await getDashboardState({ chat, chatId, store }));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/keywords") {
    const body = await readJsonBody(request);
    const keywords = Array.isArray(body.keywords)
      ? body.keywords.flatMap((keyword) => parseKeywords(String(keyword)))
      : parseKeywords(String(body.keywords ?? ""));
    await Promise.all([...new Set(keywords)].map((keyword) => store.addKeyword(chatId, keyword)));
    sendJson(response, 200, await getDashboardState({ chat, chatId, store }));
    return;
  }

  if (request.method === "DELETE" && url.pathname === "/api/keywords") {
    const body = await readJsonBody(request);
    if (body.clear === true) {
      await store.clearKeywords(chatId);
    } else {
      const keywords = Array.isArray(body.keywords)
        ? body.keywords.flatMap((keyword) => parseKeywords(String(keyword)))
        : parseKeywords(String(body.keywords ?? ""));
      await Promise.all(
        [...new Set(keywords)].map((keyword) => store.removeKeyword(chatId, keyword))
      );
    }

    sendJson(response, 200, await getDashboardState({ chat, chatId, store }));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/filters") {
    const body = await readJsonBody(request);
    const triggers = Array.isArray(body.triggers)
      ? body.triggers.flatMap((trigger) => parseKeywords(String(trigger)))
      : parseKeywords(String(body.triggers ?? ""));
    const replyText = String(body.replyText ?? "").trim();
    if (!replyText) {
      sendJson(response, 400, { error: "Reply text is required." });
      return;
    }

    await Promise.all(
      [...new Set(triggers)].map((trigger) => store.addFilterRule(chatId, trigger, replyText))
    );
    sendJson(response, 200, await getDashboardState({ chat, chatId, store }));
    return;
  }

  if (request.method === "DELETE" && url.pathname === "/api/filters") {
    const body = await readJsonBody(request);
    if (body.clear === true) {
      await store.clearFilterRules(chatId);
    } else {
      const triggers = Array.isArray(body.triggers)
        ? body.triggers.flatMap((trigger) => parseKeywords(String(trigger)))
        : parseKeywords(String(body.triggers ?? ""));
      await Promise.all(
        [...new Set(triggers)].map((trigger) => store.removeFilterRule(chatId, trigger))
      );
    }

    sendJson(response, 200, await getDashboardState({ chat, chatId, store }));
    return;
  }

  sendJson(response, 404, { error: "Not found." });
};

const handleWebhookRequest = async ({ bot, request, response, webhookSecret }) => {
  if (!bot) {
    sendText(response, 404, "Not found");
    return;
  }

  if (request.method !== "POST") {
    sendText(response, 405, "Method not allowed");
    return;
  }

  if (
    webhookSecret &&
    request.headers["x-telegram-bot-api-secret-token"] !== webhookSecret
  ) {
    sendText(response, 401, "Unauthorized");
    return;
  }

  const update = await readJsonBody(request);
  response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ ok: true }));

  bot.handleUpdate(update).catch((error) => {
    console.error(`webhook update failed: ${error.stack ?? error.message}`);
  });
};

const serveStatic = async (request, response, url) => {
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": MIME_TYPES[path.extname(filePath)] ?? "application/octet-stream"
    });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
};

const startDashboardServer = ({
  adminPassword,
  adminUsername,
  bot,
  botToken,
  port,
  store,
  telegram,
  webhookSecret
}) => {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    let handler;
    if (url.pathname === "/telegram/webhook") {
      handler = handleWebhookRequest({ bot, request, response, webhookSecret });
    } else if (url.pathname.startsWith("/api/")) {
      handler = handleApiRequest({
        adminPassword,
        adminUsername,
        botToken,
        request,
        response,
        store,
        telegram,
        url
      });
    } else {
      handler = serveStatic(request, response, url);
    }

    handler.catch((error) => {
      console.error(error);
      sendJson(response, 500, { error: "Internal server error." });
    });
  });

  server.listen(port, () => {
    console.log(`dashboard listening on http://localhost:${port}`);
  });

  return () =>
    new Promise((resolve) => {
      server.close(resolve);
    });
};

module.exports = {
  startDashboardServer
};
