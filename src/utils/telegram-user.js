const parseTelegramUserId = (value) => {
  if (!/^\d{1,16}$/.test(value)) {
    return null;
  }

  const userId = Number(value);
  return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
};

const resolveTelegramUserId = async (value, identityService) => {
  const userId = parseTelegramUserId(value);
  if (userId) {
    return userId;
  }

  if (!value || !identityService) {
    return null;
  }

  let user;
  try {
    user = await identityService.getUserByUsername(value);
  } catch (error) {
    if (error.code === "invalid_username") {
      return null;
    }

    throw error;
  }

  const resolvedUserId = Number(user.id);
  return Number.isSafeInteger(resolvedUserId) && resolvedUserId > 0 ? resolvedUserId : null;
};

module.exports = {
  parseTelegramUserId,
  resolveTelegramUserId
};
