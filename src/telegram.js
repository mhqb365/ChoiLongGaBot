const { readFile } = require("node:fs/promises");
const { basename } = require("node:path");
const { Agent, fetch, File, FormData } = require("undici");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class TelegramApi {
  constructor(token, options = {}) {
    this.baseUrl = `https://api.telegram.org/bot${token}`;
    this.pollingRequestGraceSeconds = options.pollingRequestGraceSeconds ?? 20;
    this.pollingTimeoutMs = (options.pollingTimeoutSeconds ?? 30) * 1000;
    this.requestTimeoutMs = (options.requestTimeoutSeconds ?? 30) * 1000;
    this.maxRetries = options.maxRetries ?? 2;
    this.retryBaseDelayMs = options.retryBaseDelayMs ?? 500;
    this.transportTimeoutMs = Math.max(
      this.requestTimeoutMs,
      this.pollingTimeoutMs + this.pollingRequestGraceSeconds * 1000
    );
    this.dispatcher = new Agent({
      connect: {
        timeout: (options.connectTimeoutSeconds ?? 30) * 1000
      },
      headersTimeout: this.transportTimeoutMs,
      bodyTimeout: this.transportTimeoutMs
    });
  }

  getTimeoutMs(method, payload) {
    if (method === "getUpdates") {
      return ((payload.timeout ?? 30) + this.pollingRequestGraceSeconds) * 1000;
    }

    return this.requestTimeoutMs;
  }

  getMaxAttempts(method) {
    return method === "getUpdates" ? 1 : this.maxRetries + 1;
  }

  createError(message, retryable = false) {
    const error = new Error(message);
    error.retryable = retryable;
    return error;
  }

  async request(method, payload) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.getTimeoutMs(method, payload));
    const isMultipart = payload instanceof FormData;

    let response;
    try {
      response = await fetch(`${this.baseUrl}/${method}`, {
        method: "POST",
        headers: isMultipart ? undefined : { "content-type": "application/json" },
        body: isMultipart ? payload : JSON.stringify(payload),
        dispatcher: this.dispatcher,
        signal: controller.signal
      });
    } catch (error) {
      if (error.name === "AbortError") {
        throw this.createError(`${method} timed out`, true);
      }

      throw this.createError(
        `${method} fetch failed: ${error.cause?.message ?? error.message}`,
        true
      );
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json();
    if (!data.ok) {
      throw this.createError(`${method} failed: ${data.description ?? "Unknown Telegram error"}`);
    }

    return data.result;
  }

  async call(method, payload = {}) {
    const maxAttempts = this.getMaxAttempts(method);

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await this.request(method, payload);
      } catch (error) {
        if (!error.retryable || attempt === maxAttempts) {
          throw error;
        }

        await sleep(this.retryBaseDelayMs * attempt);
      }
    }

    throw this.createError(`${method} failed after retries`);
  }

  getUpdates(payload) {
    return this.call("getUpdates", payload);
  }

  getMe() {
    return this.call("getMe");
  }

  getChat(chatId) {
    return this.call("getChat", { chat_id: chatId });
  }

  sendMessage(payload) {
    return this.call("sendMessage", payload);
  }

  async sendPhoto(payload) {
    const form = new FormData();

    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (key === "photo" && typeof value === "string") {
        const buffer = await readFile(value);
        form.set("photo", new File([buffer], basename(value), { type: "image/png" }));
        continue;
      }

      form.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
    }

    return this.call("sendPhoto", form);
  }

  answerCallbackQuery(callbackQueryId, text, showAlert = false) {
    return this.call("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert
    });
  }

  deleteMessage(chatId, messageId) {
    return this.call("deleteMessage", { chat_id: chatId, message_id: messageId });
  }

  restrictChatMember(chatId, userId, permissions, options = {}) {
    const payload = {
      chat_id: chatId,
      user_id: userId,
      permissions
    };

    if (options.untilDate) {
      payload.until_date = options.untilDate;
    }

    return this.call("restrictChatMember", payload);
  }

  banChatMember(chatId, userId) {
    return this.call("banChatMember", {
      chat_id: chatId,
      user_id: userId,
      revoke_messages: true
    });
  }

  unbanChatMember(chatId, userId) {
    return this.call("unbanChatMember", {
      chat_id: chatId,
      user_id: userId,
      only_if_banned: true
    });
  }

  getChatMember(chatId, userId) {
    return this.call("getChatMember", { chat_id: chatId, user_id: userId });
  }
}

module.exports = {
  TelegramApi
};
