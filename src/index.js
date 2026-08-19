require("dotenv/config");

const { createBot } = require("./bot.js");
const { config, validateConfig } = require("./config.js");
const { startDashboardServer } = require("./dashboard/server.js");
const { createStore } = require("./db.js");
const { createTelegramIdentityService } = require("./services/telegram-identity.service.js");
const { TelegramApi } = require("./telegram.js");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryAfterMs = (message, fallbackMs) => {
  const match = message.match(/retry after (\d+)/i);
  return match ? Number(match[1]) * 1000 : fallbackMs;
};

// Điểm khởi động: nạp cấu hình, kết nối Telegram/MongoDB rồi chạy polling.
const main = async () => {
  validateConfig();

  const telegram = new TelegramApi(config.botToken, {
    connectTimeoutSeconds: config.telegramConnectTimeoutSeconds,
    maxRetries: config.telegramMaxRetries,
    pollingRequestGraceSeconds: config.pollingRequestGraceSeconds,
    pollingTimeoutSeconds: config.pollingTimeoutSeconds,
    requestTimeoutSeconds: config.telegramRequestTimeoutSeconds
  });
  const botProfile = await telegram.getMe();
  const store = await createStore(config);
  const identityService = createTelegramIdentityService({
    apiHash: config.telegramApiHash,
    apiId: config.telegramApiId,
    botToken: config.botToken,
    stringSession: config.telegramStringSession
  });
  const bot = createBot({
    identityService,
    telegram,
    store
  });
  const stopDashboardServer = startDashboardServer({
    botToken: config.botToken,
    port: config.dashboardPort,
    store,
    telegram
  });

  let offset = 0;
  let pollingRetryMs = config.pollingRetryBaseSeconds * 1000;
  let shuttingDown = false;

  const shutdown = async () => {
    shuttingDown = true;
    bot.stop();
    await identityService.disconnect();
    await stopDashboardServer();
    await store.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log(
    `anti-spam-bot started as @${botProfile.username} with database:`,
    process.env.ANTI_SPAM_MONGODB_DB
  );

  // Polling dùng offset để mỗi update Telegram chỉ được xử lý một lần.
  while (!shuttingDown) {
    try {
      const updates = await telegram.getUpdates({
        offset,
        timeout: config.pollingTimeoutSeconds,
        allowed_updates: ["message", "callback_query", "chat_member"]
      });

      for (const update of updates) {
        offset = update.update_id + 1;
        await bot.handleUpdate(update);
      }

      pollingRetryMs = config.pollingRetryBaseSeconds * 1000;
    } catch (error) {
      console.error(error.message);
      await sleep(getRetryAfterMs(error.message, pollingRetryMs));
      pollingRetryMs = Math.min(pollingRetryMs * 2, config.pollingRetryMaxSeconds * 1000);
    }
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
