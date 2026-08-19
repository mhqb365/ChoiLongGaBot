const USERNAME_PATTERN = /^[a-z][a-z0-9_]{4,31}$/i;

const normalizeUsername = (value) => {
  const username = value
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/t\.me\//i, "")
    .replace(/^t\.me\//i, "")
    .split(/[/?#]/)[0];

  return USERNAME_PATTERN.test(username) ? username : null;
};

const createIdentityError = (code, message) => Object.assign(new Error(message), { code });

const getEntityId = (entity) => entity.id?.toString?.() ?? String(entity.id);

const isUsernameNotFoundError = (error) => {
  const message = error.message ?? "";
  return (
    message.includes("USERNAME_NOT_OCCUPIED") ||
    message.includes("USERNAME_INVALID") ||
    message.includes("Cannot find any entity corresponding to") ||
    message.includes("Could not find the input entity")
  );
};

const createTelegramIdentityService = ({ apiHash, apiId, botToken, stringSession }) => {
  let client;
  let connecting;

  const isEnabled = () => Boolean(apiId && apiHash);

  const connect = async () => {
    if (!isEnabled()) {
      throw createIdentityError(
        "identity_unconfigured",
        "Telegram API credentials are not configured"
      );
    }

    if (client) {
      return client;
    }

    if (!connecting) {
      connecting = (async () => {
        const { TelegramClient } = require("telegram");
        const { StringSession } = require("telegram/sessions");
        const nextClient = new TelegramClient(new StringSession(stringSession), apiId, apiHash, {
          connectionRetries: 3
        });

        await nextClient.start({ botAuthToken: botToken });
        client = nextClient;
        return nextClient;
      })().finally(() => {
        connecting = null;
      });
    }

    return connecting;
  };

  const getUserByUsername = async (value) => {
    const username = normalizeUsername(value);
    if (!username) {
      throw createIdentityError("invalid_username", "Invalid Telegram username");
    }

    const telegramClient = await connect();

    try {
      const entity = await telegramClient.getEntity(username);
      if (entity?.className !== "User") {
        throw createIdentityError("not_user", "Username does not belong to a user");
      }

      return {
        firstName: entity.firstName,
        id: getEntityId(entity),
        lastName: entity.lastName,
        username: entity.username ?? username
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      if (isUsernameNotFoundError(error)) {
        throw createIdentityError("not_found", error.message);
      }

      console.error(`Telegram identity lookup failed: ${error.message}`);
      throw createIdentityError("lookup_failed", error.message);
    }
  };

  const disconnect = async () => {
    if (client) {
      await client.disconnect();
      client = null;
    }
  };

  return {
    disconnect,
    getUserByUsername,
    isEnabled
  };
};

module.exports = {
  createTelegramIdentityService,
  normalizeUsername
};
