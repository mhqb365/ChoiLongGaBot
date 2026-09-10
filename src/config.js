// Chuẩn hóa biến môi trường dùng namespace CHOILONGGABOT_*.
const toInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const config = {
  botToken: process.env.CHOILONGGABOT_BOT_TOKEN,
  mongoUri: process.env.CHOILONGGABOT_MONGODB_URI,
  mongoDb: process.env.CHOILONGGABOT_MONGODB_DB,
  dashboardPort: toInteger(process.env.CHOILONGGABOT_DASHBOARD_PORT, 8004),
  telegramConnectTimeoutSeconds: toInteger(
    process.env.CHOILONGGABOT_TELEGRAM_CONNECT_TIMEOUT_SECONDS,
    30
  ),
  telegramRequestTimeoutSeconds: toInteger(
    process.env.CHOILONGGABOT_TELEGRAM_REQUEST_TIMEOUT_SECONDS,
    30
  ),
  telegramMaxRetries: toInteger(process.env.CHOILONGGABOT_TELEGRAM_MAX_RETRIES, 2),
  telegramApiId: toInteger(process.env.CHOILONGGABOT_TELEGRAM_API_ID, 0),
  telegramApiHash: process.env.CHOILONGGABOT_TELEGRAM_API_HASH,
  telegramStringSession: process.env.CHOILONGGABOT_TELEGRAM_STRING_SESSION ?? "",
  webhookSecret: process.env.CHOILONGGABOT_WEBHOOK_SECRET ?? "",
  webhookUrl: process.env.CHOILONGGABOT_WEBHOOK_URL ?? "",
  adminUsername: process.env.CHOILONGGABOT_ADMIN_USERNAME ?? "",
  adminPassword: process.env.CHOILONGGABOT_ADMIN_PASSWORD ?? ""
};

const validateConfig = () => {
  if (!config.botToken) {
    throw new Error("Missing CHOILONGGABOT_BOT_TOKEN environment variable");
  }

  if ((config.telegramApiId || config.telegramApiHash) && !config.telegramApiId) {
    throw new Error("Missing CHOILONGGABOT_TELEGRAM_API_ID environment variable");
  }

  if ((config.telegramApiId || config.telegramApiHash) && !config.telegramApiHash) {
    throw new Error("Missing CHOILONGGABOT_TELEGRAM_API_HASH environment variable");
  }

  if (!config.webhookUrl) {
    throw new Error("Missing CHOILONGGABOT_WEBHOOK_URL environment variable");
  }
};

module.exports = {
  config,
  validateConfig
};
