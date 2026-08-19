// Tạo tên hiển thị ổn định từ snapshot MongoDB hoặc object Telegram thô.
const getDisplayName = (user) => {
  const fullName = [user?.firstName ?? user?.first_name, user?.lastName ?? user?.last_name]
    .filter(Boolean)
    .join(" ");
  return fullName || user?.username || String(user?.id ?? "unknown");
};

const formatUserLine = (user) => {
  const username = user?.username ? `@${user.username}` : "no username";
  return `${getDisplayName(user)} (${username}, id: ${user?.id ?? "unknown"})`;
};

module.exports = {
  formatUserLine,
  getDisplayName
};
