// Chuẩn hóa biến môi trường dùng namespace ANTI_SPAM_*.
const toInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toList = (value, fallback) =>
  (value ?? fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";

const config = {
  botToken: process.env.ANTI_SPAM_BOT_TOKEN,
  mongoUri: process.env.ANTI_SPAM_MONGODB_URI ?? "mongodb://127.0.0.1:27017",
  mongoDb: process.env.ANTI_SPAM_MONGODB_DB ?? "anti_spam_bot",
  mongoDnsServers: isProduction
    ? []
    : toList(process.env.ANTI_SPAM_MONGODB_DNS_SERVERS, "8.8.8.8,1.1.1.1"),
  pollingTimeoutSeconds: toInteger(process.env.ANTI_SPAM_POLLING_TIMEOUT_SECONDS, 30),
  pollingRequestGraceSeconds: toInteger(process.env.ANTI_SPAM_POLLING_REQUEST_GRACE_SECONDS, 20),
  pollingRetryBaseSeconds: toInteger(process.env.ANTI_SPAM_POLLING_RETRY_BASE_SECONDS, 5),
  pollingRetryMaxSeconds: toInteger(process.env.ANTI_SPAM_POLLING_RETRY_MAX_SECONDS, 60),
  dashboardPort: toInteger(process.env.ANTI_SPAM_DASHBOARD_PORT, 3000),
  telegramConnectTimeoutSeconds: toInteger(
    process.env.ANTI_SPAM_TELEGRAM_CONNECT_TIMEOUT_SECONDS,
    30
  ),
  telegramRequestTimeoutSeconds: toInteger(
    process.env.ANTI_SPAM_TELEGRAM_REQUEST_TIMEOUT_SECONDS,
    30
  ),
  telegramMaxRetries: toInteger(process.env.ANTI_SPAM_TELEGRAM_MAX_RETRIES, 2),
  telegramApiId: toInteger(process.env.ANTI_SPAM_TELEGRAM_API_ID, 0),
  telegramApiHash: process.env.ANTI_SPAM_TELEGRAM_API_HASH,
  telegramStringSession: process.env.ANTI_SPAM_TELEGRAM_STRING_SESSION ?? ""
};

const validateConfig = () => {
  if (!config.botToken) {
    throw new Error("Missing ANTI_SPAM_BOT_TOKEN environment variable");
  }

  if ((config.telegramApiId || config.telegramApiHash) && !config.telegramApiId) {
    throw new Error("Missing ANTI_SPAM_TELEGRAM_API_ID environment variable");
  }

  if ((config.telegramApiId || config.telegramApiHash) && !config.telegramApiHash) {
    throw new Error("Missing ANTI_SPAM_TELEGRAM_API_HASH environment variable");
  }
};

module.exports = {
  config,
  validateConfig
};
