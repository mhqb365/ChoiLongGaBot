const ADMIN_STATUSES = ["creator", "administrator"];

const isAdminStatus = (status) => ADMIN_STATUSES.includes(status);

// Kiểm tra quyền theo dữ liệu getChatMember của Telegram.
const createPermissionService = ({ telegram }) => {
  const isAdmin = async (chatId, userId) => {
    const member = await telegram.getChatMember(chatId, userId);
    return isAdminStatus(member.status);
  };

  const canModerateUser = async (chatId, userId) => {
    const member = await telegram.getChatMember(chatId, userId);
    return !isAdminStatus(member.status);
  };

  return {
    isAdmin,
    canModerateUser
  };
};

module.exports = {
  createPermissionService,
  isAdminStatus
};
