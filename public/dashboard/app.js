const telegram = window.Telegram?.WebApp;
const telegramLanguage = telegram?.initDataUnsafe?.user?.language_code;
const defaultLanguage = telegramLanguage?.startsWith("vi") ? "vi" : "en";

const translations = {
  vi: {
    add: "Thêm",
    banLinkSenders: "Ban người gửi link ref",
    banStorySenders: "Ban người gửi story",
    banned: "Đã ban",
    blocklistTitle: "Từ cấm",
    cleanLinkMessages: "Dọn link ref (không ban)",
    cleanServiceMessages: "Dọn tin hệ thống",
    cleanStoryMessages: "Dọn story (không ban)",
    clearAll: "Xóa hết",
    copyAll: "Copy tất cả",
    clearSelection: "Bỏ chọn",
    closeNotification: "Đóng thông báo",
    copiedKeywords: "Đã copy toàn bộ từ khóa.",
    commandAccessAdmin: "Admin",
    commandAccessMember: "Mọi người",
    commandActive: "Kích hoạt group để hiện trong dashboard.",
    commandBan: "Reply user hoặc nhập user ID/@username để ban.",
    commandDeactive: "Xóa cấu hình và dữ liệu group khỏi bot.",
    commandExamples: "Ví dụ",
    commandId: "Lấy Telegram user ID từ username.",
    commandLock: "Reply user hoặc nhập user ID/@username để khóa quyền chat.",
    commandReport: "Reply tin spam để báo admin.",
    commandUnban: "Reply user hoặc nhập user ID/@username để gỡ ban.",
    commandUnlock: "Reply user hoặc nhập user ID/@username để mở quyền chat.",
    commandUnwarn: "Reply user hoặc nhập user ID/@username để xóa toàn bộ cảnh báo.",
    commandWarn: "Reply user hoặc nhập user ID/@username để cảnh báo.",
    commandReplyDeleteSeconds: "Tự xóa phản hồi sau (giây)",
    commands: "Lệnh trong nhóm",
    config: "Cấu hình",
    confirmClearKeywords: "Xóa toàn bộ blocklist?",
    confirmClearFilters: "Xóa toàn bộ filter?",
    copyFailed: "Không thể copy từ khóa.",
    keywordPlaceholder: "có thể thêm nhiều câu từ, phân tách bằng dấu phẩy hoặc xuống dòng",
    keywords: "Từ khóa",
    filterReplyPlaceholder: "nội dung trả lời",
    filterTitle: "Trả lời tự động",
    filterTriggerPlaceholder:
      "từ khóa hoặc cụm từ kích hoạt, phân tách bằng dấu phẩy hoặc xuống dòng",
    noFiltersToCopy: "Không có filter để copy.",
    noKeywordsToCopy: "Không có từ khóa để copy.",
    keywordsUpdated: "Đã cập nhật blocklist.",
    language: "Ngôn ngữ",
    loaded: "Đã tải cấu hình.",
    managedGroups: "Nhóm bạn quản lý",
    memberVerificationEnabled: "Xác minh người mới",
    memberVerificationTimeoutMinutes: "Thời gian xác minh (phút)",
    noGroups: "Không tìm thấy nhóm bạn quản lý.",
    openInTelegram: "Mở dashboard bằng Telegram Mini App.",
    refresh: "Tải lại",
    removeSelected: "Xóa",
    removeSelectedCount: (count) => `Xóa ${count}`,
    saved: "Đã lưu.",
    supportActionIgnore: "Kệ mịa bạn",
    supportActionUnban: "Bỏ chặn",
    supportActionUnlock: "Mở khóa",
    supportGroup: "Nhóm",
    supportModerationContext: "Lịch sử moderation",
    supportModerationSummary: ({ banCount, latestBan, latestWarning, warningCount }) =>
      `Cảnh báo: ${warningCount}${latestWarning ? ` · Gần nhất: ${latestWarning}` : ""} · Đã ban: ${banCount}${latestBan ? ` · Ban gần nhất: ${latestBan}` : ""}`,
    supportNoRequests: "Chưa có yêu cầu hỗ trợ nào cho nhóm này.",
    supportResolved: "Đã xử lý",
    supportRequests: "Yêu cầu hỗ trợ",
    unbanned: "Đã gỡ ban"
  },
  en: {
    add: "Add",
    banLinkSenders: "Ban ref link senders",
    banStorySenders: "Ban story senders",
    banned: "Banned",
    blocklistTitle: "Blocklist",
    cleanLinkMessages: "Clean ref links (no ban)",
    cleanServiceMessages: "Clean service messages",
    cleanStoryMessages: "Clean stories (no ban)",
    clearAll: "Clear all",
    copyAll: "Copy all",
    clearSelection: "Clear selection",
    closeNotification: "Close notification",
    copiedKeywords: "Copied all keywords.",
    commandAccessAdmin: "Admin",
    commandAccessMember: "Everyone",
    commandActive: "Activate the group so it appears in the dashboard.",
    commandBan: "Reply to a user or enter a user ID/@username to ban.",
    commandClean: "Delete tracked messages from a user.",
    commandBye: "Delete a user's tracked messages, then ban the user.",
    commandDeactive: "Remove this group's settings and data from the bot.",
    commandExamples: "Examples",
    commandId: "Resolve a Telegram user ID from a username.",
    commandLock: "Reply to a user or enter a user ID/@username to lock chat permission.",
    commandReport: "Reply to a spam message to report it to admins.",
    commandStatus: "Check a user's lock, ban, and verification status.",
    commandUnban: "Reply to a user or enter a user ID/@username to unban.",
    commandUnlock: "Reply to a user or enter a user ID/@username to unlock chat permission.",
    commandUnwarn: "Reply to a user or enter a user ID/@username to clear all warnings.",
    commandWarn: "Reply to a user or enter a user ID/@username to warn.",
    commandReplyDeleteSeconds: "Auto-delete replies after (seconds)",
    commands: "Group commands",
    config: "Settings",
    confirmClearKeywords: "Clear the entire blocklist?",
    confirmClearFilters: "Clear the entire filter list?",
    copyFailed: "Could not copy keywords.",
    keywordPlaceholder: "add multiple phrases, separated by commas or new lines",
    keywords: "Keywords",
    filterReplyPlaceholder: "fixed reply content",
    filterTitle: "Reply filter",
    filterTriggerPlaceholder: "trigger keyword or phrase",
    noFiltersToCopy: "There are no filters to copy.",
    noKeywordsToCopy: "There are no keywords to copy.",
    keywordsUpdated: "Blocklist updated.",
    language: "Language",
    loaded: "Settings loaded.",
    managedGroups: "Groups you manage",
    memberVerificationEnabled: "Verify new members",
    memberVerificationTimeoutMinutes: "Verification time (minutes)",
    noGroups: "No manageable groups found.",
    openInTelegram: "Open the dashboard from the Telegram Mini App.",
    refresh: "Refresh",
    removeSelected: "Remove",
    removeSelectedCount: (count) => `Remove ${count}`,
    saved: "Saved.",
    supportActionIgnore: "Ignore",
    supportActionUnban: "Unban",
    supportActionUnlock: "Unlock",
    supportGroup: "Group",
    supportModerationContext: "Moderation history",
    supportModerationSummary: ({ banCount, latestBan, latestWarning, warningCount }) =>
      `Warnings: ${warningCount}${latestWarning ? ` · Latest: ${latestWarning}` : ""} · Bans: ${banCount}${latestBan ? ` · Latest ban: ${latestBan}` : ""}`,
    supportNoRequests: "No support requests for this group yet.",
    supportResolved: "Resolved",
    supportRequests: "Support requests",
    unbanned: "Unbanned"
  }
};

const state = {
  chatId: localStorage.getItem("antiSpamChatId") ?? "",
  chats: [],
  dashboard: null,
  language: localStorage.getItem("antiSpamDashboardLanguage") ?? defaultLanguage,
  loading: false,
  selectedKeywords: new Set(),
  selectedFilters: new Set(),
  keywordListExpanded: false,
  filterListExpanded: false,
  commandReplyDeleteTimer: null,
  memberVerificationTimeoutTimer: null,
  statusTimer: null
};

const elements = {
  addKeywordsButton: document.querySelector("#addKeywordsButton"),
  bannedCount: document.querySelector("#bannedCount"),
  chatSelect: document.querySelector("#chatSelect"),
  commandReplyDeleteSecondsInput: document.querySelector("#commandReplyDeleteSecondsInput"),
  clearKeywordsButton: document.querySelector("#clearKeywordsButton"),
  clearFiltersButton: document.querySelector("#clearFiltersButton"),
  copyKeywordsButton: document.querySelector("#copyKeywordsButton"),
  commandList: document.querySelector("#commandList"),
  dashboard: document.querySelector("#dashboard"),
  addFiltersButton: document.querySelector("#addFiltersButton"),
  clearFilterSelectionButton: document.querySelector("#clearFilterSelectionButton"),
  filterList: document.querySelector("#filterList"),
  filterReplyInput: document.querySelector("#filterReplyInput"),
  filterTriggerInput: document.querySelector("#filterTriggerInput"),
  keywordCount: document.querySelector("#keywordCount"),
  keywordInput: document.querySelector("#keywordInput"),
  keywordList: document.querySelector("#keywordList"),
  toggleFilterListButton: document.querySelector("#toggleFilterListButton"),
  toggleKeywordListButton: document.querySelector("#toggleKeywordListButton"),
  languageSelect: document.querySelector("#languageSelect"),
  loadingOverlay: document.querySelector("#loadingOverlay"),
  memberVerificationTimeoutField: document.querySelector("#memberVerificationTimeoutField"),
  memberVerificationTimeoutMinutesInput: document.querySelector(
    "#memberVerificationTimeoutMinutesInput"
  ),
  refreshButton: document.querySelector("#refreshButton"),
  clearSelectionButton: document.querySelector("#clearSelectionButton"),
  removeSelectedFiltersButton: document.querySelector("#removeSelectedFiltersButton"),
  removeSelectedKeywordsButton: document.querySelector("#removeSelectedKeywordsButton"),
  status: document.querySelector("#status"),
  statusCloseButton: document.querySelector("#statusCloseButton"),
  statusMessage: document.querySelector("#statusMessage"),
  supportPanelCount: document.querySelector("#supportPanelCount"),
  supportRequestList: document.querySelector("#supportRequestList"),
  unbannedCount: document.querySelector("#unbannedCount")
};

const getUrlInitData = () => {
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const searchParams = new URLSearchParams(window.location.search);
  return hashParams.get("tgWebAppData") ?? searchParams.get("tgWebAppData") ?? "";
};

const getInitData = () => telegram?.initData || getUrlInitData();

const translate = (key, params) => {
  const value = translations[state.language]?.[key] ?? translations.en[key] ?? key;
  return typeof value === "function" ? value(params) : value;
};

const capitalize = (value) => `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

const formatRequester = (user = {}) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const username = user.username ? `@${user.username}` : "no username";
  return `${fullName || user.username || user.id || "unknown"} (${username}, id: ${
    user.id ?? "unknown"
  })`;
};

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(state.language === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
};

const getRequestModerationContext = (request) =>
  request.moderationContext?.find((context) => String(context.chatId) === state.chatId);

const formatLatestBan = (context) => {
  if (!context?.latestBanAt) {
    return "";
  }

  const parts = [formatDateTime(context.latestBanAt), context.latestBanReason].filter(Boolean);
  if (context.latestMatchedKeyword) {
    parts.push(context.latestMatchedKeyword);
  }

  return parts.join(" · ");
};

const formatLatestWarning = (context) => {
  if (!context?.latestWarningAt) {
    return "";
  }

  const parts = [formatDateTime(context.latestWarningAt), context.latestWarningReason].filter(
    Boolean
  );
  if (context.latestWarningMatchedKeyword) {
    parts.push(context.latestWarningMatchedKeyword);
  }

  return parts.join(" · ");
};

const applyTranslations = () => {
  document.documentElement.lang = state.language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.title = translate(element.dataset.i18nTitle);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = translate(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", translate(element.dataset.i18nAriaLabel));
  });
  renderSelectionStatus();
};

const renderKeywordInputStatus = () => {
  elements.addKeywordsButton.disabled = state.loading || !elements.keywordInput.value.trim();
};

const setLoading = (loading) => {
  state.loading = loading;
  document.querySelectorAll("button, input, select, textarea").forEach((element) => {
    if (element === elements.statusCloseButton) {
      return;
    }

    element.disabled = loading;
  });
  renderKeywordInputStatus();
  renderSelectionStatus();
};

const hideInitialLoading = () => {
  elements.loadingOverlay.hidden = true;
};

const hideStatus = () => {
  if (state.statusTimer) {
    clearTimeout(state.statusTimer);
    state.statusTimer = null;
  }

  elements.status.hidden = true;
};

const showStatus = (message, type = "") => {
  hideStatus();

  elements.status.hidden = !message;
  elements.status.className = `toast ${type}`.trim();
  elements.statusMessage.textContent = message;

  if (message) {
    state.statusTimer = setTimeout(hideStatus, 5_000);
  }
};

const request = async (path, options = {}) => {
  const initData = getInitData();
  if (!initData) {
    throw new Error(translate("openInTelegram"));
  }

  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      "x-telegram-init-data": initData,
      ...(options.headers ?? {})
    }
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload;
};

const getChatId = () => elements.chatSelect.value;

const updateChatOptions = (chats) => {
  state.chats = chats;
  elements.chatSelect.replaceChildren(
    ...chats.map((chat) => {
      const option = document.createElement("option");
      option.value = String(chat.id);
      option.textContent = chat.title;
      return option;
    })
  );

  if (chats.some((chat) => String(chat.id) === state.chatId)) {
    elements.chatSelect.value = state.chatId;
  } else if (chats[0]) {
    elements.chatSelect.value = String(chats[0].id);
    state.chatId = elements.chatSelect.value;
  }
};

const updateDashboard = (payload) => {
  state.dashboard = payload;
  state.chatId = String(payload.chat.id);
  state.language = payload.settings.language;
  state.selectedKeywords = new Set(
    [...state.selectedKeywords].filter((keyword) => payload.keywords.includes(keyword))
  );
  state.selectedFilters = new Set(
    [...state.selectedFilters].filter((trigger) =>
      payload.filters?.some((row) => row.trigger === trigger)
    )
  );
  localStorage.setItem("antiSpamChatId", state.chatId);
  localStorage.setItem("antiSpamDashboardLanguage", state.language);

  elements.dashboard.hidden = false;
  elements.keywordCount.textContent = payload.stats.keywordCount;
  elements.filterCount && (elements.filterCount.textContent = payload.stats.filterCount);
  elements.bannedCount.textContent = payload.stats.bannedUserCount;
  elements.supportPanelCount.textContent = payload.supportRequests?.length ?? 0;
  elements.languageSelect.value = payload.settings.language;
  elements.commandReplyDeleteSecondsInput.value = payload.settings.commandReplyDeleteSeconds;
  elements.memberVerificationTimeoutMinutesInput.value =
    payload.settings.memberVerificationTimeoutMinutes;

  document.querySelectorAll("[data-setting]").forEach((input) => {
    input.checked = Boolean(payload.settings[input.dataset.setting]);
  });
  elements.memberVerificationTimeoutField.hidden = !payload.settings.memberVerificationEnabled;

  applyTranslations();
  renderCommands(payload.commands);
  renderKeywords(payload.keywords);
  renderFilters(payload.filters);
  renderSupportRequests(payload.supportRequests);
  renderKeywordInputStatus();
};

const renderCommands = (commands = []) => {
  elements.commandList.replaceChildren(
    ...commands.map((command) => {
      const item = document.createElement("article");
      const header = document.createElement("div");
      const name = document.createElement("code");
      const access = document.createElement("span");
      const description = document.createElement("p");
      const examples = document.createElement("small");

      item.className = "command-item";
      header.className = "command-header";
      name.textContent = command.command;
      access.className = "command-access";
      access.textContent = translate(`commandAccess${capitalize(command.access)}`);
      description.textContent = translate(command.descriptionKey);
      examples.textContent = `${translate("commandExamples")}: ${command.examples.join(", ")}`;

      header.append(name, access);
      item.append(header, description, examples);
      return item;
    })
  );
};

const renderSelectionStatus = () => {
  const count = state.selectedKeywords.size;
  const hasKeywords = (state.dashboard?.keywords.length ?? 0) > 0;
  const hasSelection = count > 0;
  elements.removeSelectedKeywordsButton.hidden = !hasKeywords;
  elements.clearSelectionButton.hidden = !hasKeywords;
  elements.removeSelectedKeywordsButton.textContent = hasSelection
    ? translate("removeSelectedCount", count)
    : translate("removeSelected");

  if (!hasKeywords) {
    return;
  }

  elements.removeSelectedKeywordsButton.disabled = state.loading || count === 0;
  elements.clearSelectionButton.disabled = state.loading || count === 0;
};

const toggleKeywordSelection = (keyword, item) => {
  if (state.selectedKeywords.has(keyword)) {
    state.selectedKeywords.delete(keyword);
  } else {
    state.selectedKeywords.add(keyword);
  }

  item.ariaPressed = String(state.selectedKeywords.has(keyword));
  renderSelectionStatus();
};

const renderKeywords = (keywords) => {
  elements.keywordList.replaceChildren(
    ...keywords.map((keyword) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "keyword-chip";
      item.textContent = keyword;
      item.ariaPressed = String(state.selectedKeywords.has(keyword));
      item.addEventListener("click", () => toggleKeywordSelection(keyword, item));
      return item;
    })
  );
  const shouldShowToggle = state.keywordListExpanded || elements.keywordList.scrollHeight > 144;
  elements.toggleKeywordListButton.hidden = !shouldShowToggle;
  elements.toggleKeywordListButton.textContent = state.keywordListExpanded ? "Thu gọn" : "Xem thêm";
  elements.keywordList.classList.toggle("is-expanded", state.keywordListExpanded);
  renderSelectionStatus();
};

const renderFilterSelectionStatus = () => {
  const count = state.selectedFilters.size;
  const hasFilters = (state.dashboard?.filters.length ?? 0) > 0;
  const hasSelection = count > 0;
  elements.removeSelectedFiltersButton.hidden = !hasFilters;
  elements.clearFilterSelectionButton.hidden = !hasFilters;
  elements.removeSelectedFiltersButton.textContent = hasSelection
    ? translate("removeSelectedCount", count)
    : translate("removeSelected");
  elements.removeSelectedFiltersButton.disabled = state.loading || count === 0;
  elements.clearFilterSelectionButton.disabled = state.loading || count === 0;
};

const toggleFilterSelection = (trigger, item) => {
  if (state.selectedFilters.has(trigger)) {
    state.selectedFilters.delete(trigger);
  } else {
    state.selectedFilters.add(trigger);
  }

  item.ariaPressed = String(state.selectedFilters.has(trigger));
  renderFilterSelectionStatus();
};

const renderFilters = (filters = []) => {
  elements.filterList.replaceChildren(
    ...filters.map((filter) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "keyword-chip";
      item.textContent = `${filter.trigger} → ${filter.replyText}`;
      item.ariaPressed = String(state.selectedFilters.has(filter.trigger));
      item.addEventListener("click", () => toggleFilterSelection(filter.trigger, item));
      return item;
    })
  );
  const shouldShowToggle = state.filterListExpanded || elements.filterList.scrollHeight > 144;
  elements.toggleFilterListButton.hidden = !shouldShowToggle;
  elements.toggleFilterListButton.textContent = state.filterListExpanded ? "Thu gọn" : "Xem thêm";
  elements.filterList.classList.toggle("is-expanded", state.filterListExpanded);
  renderFilterSelectionStatus();
};

const renderSupportRequests = (requests = []) => {
  if (requests.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = translate("supportNoRequests");
    elements.supportRequestList.replaceChildren(empty);
    return;
  }

  elements.supportRequestList.replaceChildren(
    ...requests.map((request) => {
      const item = document.createElement("article");
      const header = document.createElement("div");
      const requester = document.createElement("strong");
      const createdAt = document.createElement("time");
      const group = document.createElement("p");
      const moderation = document.createElement("p");
      const details = document.createElement("p");
      const actions = document.createElement("div");
      const moderationContext = getRequestModerationContext(request);

      item.className = "support-request-item";
      header.className = "support-request-header";
      requester.textContent = formatRequester(request.requester);
      createdAt.dateTime = request.createdAt ?? "";
      createdAt.textContent = formatDateTime(request.createdAt);
      group.className = "support-request-group";
      group.textContent = `${translate("supportGroup")}: ${request.groupQuery}`;
      moderation.className = "support-request-moderation";
      moderation.textContent = `${translate("supportModerationContext")}: ${translate(
        "supportModerationSummary",
        {
          banCount: moderationContext?.banCount ?? 0,
          latestBan: formatLatestBan(moderationContext),
          latestWarning: formatLatestWarning(moderationContext),
          warningCount: moderationContext?.warningCount ?? 0
        }
      )}`;
      details.className = "support-request-details";
      details.textContent = request.details;
      actions.className = "support-request-actions";

      header.append(requester, createdAt);
      item.append(header, group, moderation, details);

      if ((request.status ?? "pending") === "pending") {
        actions.append(
          createSupportActionButton(request.id, "unlock"),
          createSupportActionButton(request.id, "unban"),
          createSupportActionButton(request.id, "ignore")
        );
      } else {
        const resolved = document.createElement("span");
        resolved.className = "support-request-resolved";
        resolved.textContent = `${translate("supportResolved")}: ${request.resolutionAction}`;
        actions.append(resolved);
      }

      item.append(actions);
      return item;
    })
  );
};

const createSupportActionButton = (requestId, action) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = action === "ignore" ? "secondary" : "support-action-button";
  button.textContent = translate(`supportAction${capitalize(action)}`);
  button.addEventListener("click", () => resolveSupportRequest(requestId, action));
  return button;
};

const loadDashboard = async () => {
  const chatId = getChatId();
  if (!chatId) {
    showStatus(translate("noGroups"), "error");
    hideInitialLoading();
    return;
  }

  setLoading(true);
  try {
    const payload = await request(`/api/dashboard?chatId=${encodeURIComponent(chatId)}`);
    updateDashboard(payload);
    showStatus(translate("loaded"), "ok");
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    setLoading(false);
    hideInitialLoading();
  }
};

const loadChats = async () => {
  setLoading(true);
  try {
    const payload = await request("/api/chats");
    updateChatOptions(payload.chats);
    if (payload.chats.length === 0) {
      showStatus(translate("noGroups"), "error");
      hideInitialLoading();
      return;
    }

    await loadDashboard();
  } catch (error) {
    showStatus(error.message, "error");
    hideInitialLoading();
  } finally {
    setLoading(false);
  }
};

const patchSettings = async (updates) => {
  setLoading(true);
  try {
    const payload = await request(`/api/settings?chatId=${encodeURIComponent(state.chatId)}`, {
      method: "PATCH",
      body: JSON.stringify({ updates })
    });
    updateDashboard(payload);
    showStatus(translate("saved"), "ok");
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    setLoading(false);
  }
};

const updateKeywords = async (method, body) => {
  setLoading(true);
  try {
    const payload = await request(`/api/keywords?chatId=${encodeURIComponent(state.chatId)}`, {
      method,
      body: JSON.stringify(body)
    });
    if (method === "DELETE") {
      state.selectedKeywords.clear();
    }
    updateDashboard(payload);
    elements.keywordInput.value = "";
    showStatus(translate("keywordsUpdated"), "ok");
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    setLoading(false);
  }
};

const updateFilters = async (method, body) => {
  setLoading(true);
  try {
    const payload = await request(`/api/filters?chatId=${encodeURIComponent(state.chatId)}`, {
      method,
      body: JSON.stringify(body)
    });
    if (method === "DELETE") {
      state.selectedFilters.clear();
    }
    updateDashboard(payload);
    elements.filterTriggerInput.value = "";
    elements.filterReplyInput.value = "";
    showStatus(translate("saved"), "ok");
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    setLoading(false);
  }
};

const copyAllKeywords = async () => {
  const keywords = state.dashboard?.keywords ?? [];
  if (keywords.length === 0) {
    showStatus(translate("noKeywordsToCopy"), "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(keywords.join("\n"));
    showStatus(translate("copiedKeywords"), "ok");
  } catch {
    showStatus(translate("copyFailed"), "error");
  }
};

const resolveSupportRequest = async (requestId, action) => {
  setLoading(true);
  try {
    const payload = await request(
      `/api/support-requests?chatId=${encodeURIComponent(state.chatId)}`,
      {
        method: "POST",
        body: JSON.stringify({ action, requestId })
      }
    );
    updateDashboard(payload);
    showStatus(translate("saved"), "ok");
  } catch (error) {
    showStatus(error.message, "error");
  } finally {
    setLoading(false);
  }
};

elements.keywordInput.addEventListener("input", renderKeywordInputStatus);
elements.refreshButton.addEventListener("click", loadChats);
elements.chatSelect.addEventListener("change", loadDashboard);
elements.languageSelect.addEventListener("change", () =>
  patchSettings({ language: elements.languageSelect.value })
);
elements.commandReplyDeleteSecondsInput.addEventListener("input", () => {
  if (state.commandReplyDeleteTimer) {
    clearTimeout(state.commandReplyDeleteTimer);
  }

  state.commandReplyDeleteTimer = setTimeout(() => {
    state.commandReplyDeleteTimer = null;
    if (!elements.commandReplyDeleteSecondsInput.value) {
      return;
    }

    const seconds = Number.parseInt(elements.commandReplyDeleteSecondsInput.value, 10);
    if (!Number.isInteger(seconds)) {
      return;
    }

    const normalizedSeconds = Math.min(Math.max(seconds, 1), 60);
    elements.commandReplyDeleteSecondsInput.value = normalizedSeconds;
    patchSettings({ commandReplyDeleteSeconds: normalizedSeconds });
  }, 500);
});
elements.commandReplyDeleteSecondsInput.addEventListener("change", () => {
  const seconds = Number.parseInt(elements.commandReplyDeleteSecondsInput.value, 10);
  if (!Number.isInteger(seconds)) {
    return;
  }

  const normalizedSeconds = Math.min(Math.max(seconds, 1), 60);
  elements.commandReplyDeleteSecondsInput.value = normalizedSeconds;
  patchSettings({ commandReplyDeleteSeconds: normalizedSeconds });
});
elements.memberVerificationTimeoutMinutesInput.addEventListener("input", () => {
  if (state.memberVerificationTimeoutTimer) {
    clearTimeout(state.memberVerificationTimeoutTimer);
  }

  state.memberVerificationTimeoutTimer = setTimeout(() => {
    state.memberVerificationTimeoutTimer = null;
    if (!elements.memberVerificationTimeoutMinutesInput.value) {
      return;
    }

    const minutes = Number.parseInt(elements.memberVerificationTimeoutMinutesInput.value, 10);
    if (!Number.isInteger(minutes)) {
      return;
    }

    const normalizedMinutes = Math.min(Math.max(minutes, 1), 60);
    elements.memberVerificationTimeoutMinutesInput.value = normalizedMinutes;
    patchSettings({ memberVerificationTimeoutMinutes: normalizedMinutes });
  }, 500);
});
elements.memberVerificationTimeoutMinutesInput.addEventListener("change", () => {
  const minutes = Number.parseInt(elements.memberVerificationTimeoutMinutesInput.value, 10);
  if (!Number.isInteger(minutes)) {
    return;
  }

  const normalizedMinutes = Math.min(Math.max(minutes, 1), 60);
  elements.memberVerificationTimeoutMinutesInput.value = normalizedMinutes;
  patchSettings({ memberVerificationTimeoutMinutes: normalizedMinutes });
});
elements.addKeywordsButton.addEventListener("click", () =>
  updateKeywords("POST", { keywords: elements.keywordInput.value })
);
elements.removeSelectedKeywordsButton.addEventListener("click", () =>
  updateKeywords("DELETE", { keywords: [...state.selectedKeywords] })
);
elements.clearSelectionButton.addEventListener("click", () => {
  state.selectedKeywords.clear();
  document.querySelectorAll(".keyword-chip").forEach((item) => {
    item.ariaPressed = "false";
  });
  renderSelectionStatus();
});
elements.clearKeywordsButton.addEventListener("click", () => {
  if (window.confirm(translate("confirmClearKeywords"))) {
    updateKeywords("DELETE", { clear: true });
  }
});
elements.copyKeywordsButton.addEventListener("click", copyAllKeywords);
elements.toggleKeywordListButton.addEventListener("click", () => {
  state.keywordListExpanded = !state.keywordListExpanded;
  renderKeywords(state.dashboard?.keywords ?? []);
});
elements.addFiltersButton.addEventListener("click", () =>
  updateFilters("POST", {
    triggers: elements.filterTriggerInput.value,
    replyText: elements.filterReplyInput.value
  })
);
elements.removeSelectedFiltersButton.addEventListener("click", () =>
  updateFilters("DELETE", { triggers: [...state.selectedFilters] })
);
elements.clearFilterSelectionButton.addEventListener("click", () => {
  state.selectedFilters.clear();
  document.querySelectorAll("#filterList .keyword-chip").forEach((item) => {
    item.ariaPressed = "false";
  });
  renderFilterSelectionStatus();
});
elements.clearFiltersButton.addEventListener("click", () => {
  if (window.confirm(translate("confirmClearFilters"))) {
    updateFilters("DELETE", { clear: true });
  }
});
elements.toggleFilterListButton.addEventListener("click", () => {
  state.filterListExpanded = !state.filterListExpanded;
  renderFilters(state.dashboard?.filters ?? []);
});
elements.statusCloseButton.addEventListener("click", hideStatus);

const exclusiveSettingPairs = {
  banLinkSenders: "cleanLinkMessages",
  banStorySenders: "cleanStoryMessages",
  cleanLinkMessages: "banLinkSenders",
  cleanStoryMessages: "banStorySenders"
};

document.querySelectorAll("[data-setting]").forEach((input) => {
  input.addEventListener("change", () => {
    const setting = input.dataset.setting;
    const updates = { [setting]: input.checked };
    const pairedSetting = exclusiveSettingPairs[setting];

    if (input.checked && pairedSetting) {
      updates[pairedSetting] = false;
      document.querySelector(`[data-setting="${pairedSetting}"]`).checked = false;
    }

    if (setting === "memberVerificationEnabled") {
      elements.memberVerificationTimeoutField.hidden = !input.checked;
    }

    patchSettings(updates);
  });
});

telegram?.ready();
telegram?.expand();
applyTranslations();

if (!getInitData()) {
  showStatus(translate("openInTelegram"), "error");
  hideInitialLoading();
} else {
  loadChats();
}
