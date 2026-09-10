require("dotenv/config");

const { createBot } = require("./bot.js");
const { config, validateConfig } = require("./config.js");
const { startDashboardServer } = require("./dashboard/server.js");
const { createStore } = require("./db.js");
const { createTelegramIdentityService } = require("./services/telegram-identity.service.js");
const { TelegramApi } = require("./telegram.js");

const ALLOWED_UPDATES = ["message", "callback_query", "chat_member"];
const WEBHOOK_RETRY_MS = 10_000;

const enableWebhook = async ({ config, telegram }) => {
  const payload = {
    url: config.webhookUrl,
    allowed_updates: ALLOWED_UPDATES,
    drop_pending_updates: false
  };

  if (config.webhookSecret) {
    payload.secret_token = config.webhookSecret;
  }

  await telegram.setWebhook(payload);
  console.log(`telegram webhook enabled: ${config.webhookUrl}`);
};

const startWebhookRegistration = ({ config, telegram }) => {
  let stopped = false;
  let timer = null;

  const run = async () => {
    try {
      await enableWebhook({ config, telegram });
    } catch (error) {
      console.error(`telegram webhook setup failed: ${error.message}`);
      if (!stopped) {
        timer = setTimeout(run, WEBHOOK_RETRY_MS);
        timer.unref?.();
      }
    }
  };

  run();

  return () => {
    stopped = true;
    if (timer) {
      clearTimeout(timer);
    }
  };
};

const main = async () => {
  validateConfig();

  const telegram = new TelegramApi(config.botToken, {
    connectTimeoutSeconds: config.telegramConnectTimeoutSeconds,
    maxRetries: config.telegramMaxRetries,
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
    adminPassword: config.adminPassword,
    adminUsername: config.adminUsername,
    bot,
    botToken: config.botToken,
    port: config.dashboardPort,
    store,
    telegram,
    webhookSecret: config.webhookSecret
  });
  const stopWebhookRegistration = startWebhookRegistration({ config, telegram });

  const shutdown = async () => {
    stopWebhookRegistration();
    bot.stop();
    await identityService.disconnect();
    await stopDashboardServer();
    await store.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log(`ChoiLongGaBot started as @${botProfile.username} with database:`, config.mongoDb);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
