const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["vi", "en"];

const translations = {
  vi: {
    common: {
      skipped: "Bỏ qua: {reason}."
    },
    skipReasons: {
      targetAdmin: "đối tượng là admin"
    },
    reasons: {
      keywordMatch: "khớp từ khóa cấm",
      manualBan: "lệnh /ban thủ công",
      manualBanByUserId: "lệnh /ban thủ công bằng user ID",
      manualBye: "lệnh /bye: xóa tin nhắn và ban",
      manualWarnThreshold: "vượt quá số lần cảnh báo",
      storyMessage: "story message",
      telegramBotReferralLink: "link referral"
    },
    blocklist: {
      warning:
        "Tin nhắn đã bị xóa vì chứa từ khóa cấm.\nCảnh báo <code>{count}/{max}</code>. Tiếp tục vi phạm sẽ bị ban."
    },
    active: {
      done: "Đã kích hoạt group này. Admin có thể mở menu setup của bot để cấu hình."
    },
    clean: {
      done: "Đã xóa <code>{count}</code> tin nhắn của user ID <code>{userId}</code>.",
      usage:
        "Reply tin nhắn của người dùng với <code>/clean</code> hoặc dùng <code>/clean 123456789</code> / <code>/clean @username</code>."
    },
    bye: {
      cleaned: "Đã xóa <code>{count}</code> tin nhắn đã track.",
      usage:
        "Reply tin nhắn của người dùng với <code>/bye</code> hoặc dùng <code>/bye 123456789</code> / <code>/bye @username</code>."
    },
    status: {
      title: "Trạng thái user ID <code>{userId}</code>",
      usage:
        "Reply tin nhắn của người dùng với <code>/status</code> hoặc dùng <code>/status 123456789</code> / <code>/status @username</code>.",
      telegramStatus: "Trạng thái Telegram",
      locked: "Đang bị lock",
      banned: "Đang bị ban",
      verification: "Xác minh",
      verificationExpiresAt: "Hết hạn xác minh",
      verificationAttempts: "Số lần thử",
      yes: "có",
      no: "không",
      pending: "đang chờ",
      verified: "đã xác minh",
      expired: "hết hạn",
      unknown: "không có dữ liệu"
    },
    deactive: {
      done: "Đã hủy kích hoạt group này và xóa toàn bộ dữ liệu liên quan khỏi bot."
    },
    unlock: {
      done: "Đã mở quyền chat cho user ID <code>{userId}</code>.",
      usage:
        "Reply tin nhắn của người dùng với <code>/unlock</code> hoac dung <code>/unlock 123456789</code> / <code>/unlock @username</code>."
    },
    lock: {
      done: "Đã cấm chat cho user ID <code>{userId}</code>.",
      doneTemporary:
        "Đã cấm chat cho user ID <code>{userId}</code> trong <code>{minutes}</code> phút.",
      usage:
        "Reply tin nhắn của người dùng với <code>/lock</code>, <code>/lock 10m</code>, hoac dung <code>/lock 123456789 2h</code> / <code>/lock @username 2h</code>."
    },
    ban: {
      usage:
        "Reply tin nhắn của người dùng với <code>/ban</code> hoặc dùng <code>/ban 123456789</code> / <code>/ban @username</code>."
    },
    unban: {
      done: "Đã gỡ ban user ID <code>{userId}</code>.",
      usage:
        "Reply tin nhắn của người dùng với <code>/unban</code> hoặc dùng <code>/unban 123456789</code> / <code>/unban @username</code>."
    },
    warn: {
      done: "Đã cảnh báo user ID <code>{userId}</code>: <code>{count}/{max}</code>.",
      usage:
        "Reply tin nhắn của người dùng với <code>/warn</code> hoặc dùng <code>/warn 123456789</code> / <code>/warn @username</code>."
    },
    unwarn: {
      done: "Đã xóa toàn bộ cảnh báo của user ID <code>{userId}</code>.",
      usage:
        "Reply tin nhắn của người dùng với <code>/unwarn</code> hoặc dùng <code>/unwarn 123456789</code> / <code>/unwarn @username</code>."
    },
    id: {
      result: "Username <code>@{username}</code>\nID: <code>{id}</code>\nTên: <b>{name}</b>",
      usage: "Dùng <code>/id username</code> hoặc <code>/id @username</code>.",
      unconfigured:
        "Chưa cấu hình GramJS. Hãy cài đặt <code>CHOILONGGABOT_TELEGRAM_API_ID</code> và <code>CHOILONGGABOT_TELEGRAM_API_HASH</code>.",
      notFound: "Không tìm thấy người dùng với username này.",
      notUser: "Username này không thuộc về người dùng Telegram.",
      failed: "Lỗi GramJS khi tra username: <code>{reason}</code>."
    },
    verify: {
      challenge: "Xin chào <b>{name}</b>, hãy nhấn nút bên dưới để xác minh bạn là con người.",
      button: "Tôi không phải bot",
      expired: "Phiên xác minh đã hết hạn.",
      notForYou: "Nút xác minh này không dành cho bạn.",
      verified: "Chào mừng <b>{name}</b>, bạn đã xác minh thành công.",
      verifiedCallback: "Xác minh thành công.",
      wrongAnswer: "Sai rồi. Bạn còn {remaining} lần thử.",
      wrongLastChance: "Sai rồi. Bạn còn 1 lần thử cuối cùng."
    },
    report: {
      title: "<b>Ta phang 👊🤜💨🧹</b>",
      user: "Người dùng: {user}",
      reason: "Lý do: {reason}",
      matched: "Khớp: {value}",
      forwardSource: "Chuyển tiếp: {value}",
      links: "Liên kết: {value}",
      contentTitle: "Nội dung tin nhắn:",
      nonTextMessage: "[tin nhắn không có chữ]"
    },
    userReport: {
      title: "<b>Người dùng báo cáo spam</b>",
      target: "Đối tượng: {user}",
      usage: "Reply tin nhắn cần báo cáo với <code>/report</code>."
    }
  },
  en: {
    common: {
      skipped: "Skipped: {reason}."
    },
    skipReasons: {
      targetAdmin: "target is an admin"
    },
    reasons: {
      keywordMatch: "keyword match",
      manualBan: "manual /ban command",
      manualBanByUserId: "manual /ban command by user ID",
      manualBye: "manual /bye command: clean messages and ban",
      manualWarnThreshold: "warning threshold exceeded",
      storyMessage: "story message",
      telegramBotReferralLink: "Telegram bot referral link"
    },
    blocklist: {
      warning:
        "Message deleted for a blocked keyword.\nWarning <code>{count}/{max}</code>. Further violations will be banned."
    },
    active: {
      done: "This group is active. Admins can open the bot setup menu to configure it."
    },
    clean: {
      done: "Deleted <code>{count}</code> messages for user ID <code>{userId}</code>.",
      usage:
        "Reply to a user's message with <code>/clean</code> or use <code>/clean 123456789</code> / <code>/clean @username</code>."
    },
    bye: {
      cleaned: "Deleted <code>{count}</code> tracked messages.",
      usage:
        "Reply to a user's message with <code>/bye</code> or use <code>/bye 123456789</code> / <code>/bye @username</code>."
    },
    status: {
      title: "Status for user ID <code>{userId}</code>",
      usage:
        "Reply to a user's message with <code>/status</code> or use <code>/status 123456789</code> / <code>/status @username</code>.",
      telegramStatus: "Telegram status",
      locked: "Locked",
      banned: "Banned",
      verification: "Verification",
      verificationExpiresAt: "Verification expires at",
      verificationAttempts: "Attempts",
      yes: "yes",
      no: "no",
      pending: "pending",
      verified: "verified",
      expired: "expired",
      unknown: "no data"
    },
    deactive: {
      done: "This group has been deactivated and all related bot data has been deleted."
    },
    unlock: {
      done: "Unlocked chat permission for user ID <code>{userId}</code>.",
      usage:
        "Reply to a user's message with <code>/unlock</code> or use <code>/unlock 123456789</code> / <code>/unlock @username</code>."
    },
    lock: {
      done: "Locked chat permission for user ID <code>{userId}</code>.",
      doneTemporary:
        "Locked chat permission for user ID <code>{userId}</code> for <code>{minutes}</code> minutes.",
      usage:
        "Reply to a user's message with <code>/lock</code>, <code>/lock 10m</code>, or use <code>/lock 123456789 2h</code> / <code>/lock @username 2h</code>."
    },
    ban: {
      usage:
        "Reply to a user's message with <code>/ban</code> or use <code>/ban 123456789</code> / <code>/ban @username</code>."
    },
    unban: {
      done: "Unbanned user ID <code>{userId}</code>.",
      usage:
        "Reply to a user's message with <code>/unban</code> or use <code>/unban 123456789</code> / <code>/unban @username</code>."
    },
    warn: {
      done: "Warned user ID <code>{userId}</code>: <code>{count}/{max}</code>.",
      usage:
        "Reply to a user's message with <code>/warn</code> or use <code>/warn 123456789</code> / <code>/warn @username</code>."
    },
    unwarn: {
      done: "Cleared all warnings for user ID <code>{userId}</code>.",
      usage:
        "Reply to a user's message with <code>/unwarn</code> or use <code>/unwarn 123456789</code> / <code>/unwarn @username</code>."
    },
    id: {
      result: "Username <code>@{username}</code>\nID: <code>{id}</code>\nName: <b>{name}</b>",
      usage: "Use <code>/id username</code> or <code>/id @username</code>.",
      unconfigured:
        "GramJS is not configured. Set <code>CHOILONGGABOT_TELEGRAM_API_ID</code> and <code>CHOILONGGABOT_TELEGRAM_API_HASH</code>.",
      notFound: "No user was found for that username.",
      notUser: "That username does not belong to a Telegram user.",
      failed: "GramJS username lookup failed: <code>{reason}</code>."
    },
    verify: {
      challenge: "Welcome <b>{name}</b>. Tap the button below to verify you are human.",
      button: "I am not a bot",
      expired: "This verification has expired.",
      notForYou: "This verification button is not for you.",
      verified: "Welcome <b>{name}</b>, you have been verified.",
      verifiedCallback: "Verification successful.",
      wrongAnswer: "Wrong answer. You have {remaining} attempts left.",
      wrongLastChance: "Wrong answer. This is your last attempt."
    },
    report: {
      title: "<b>Go away 👊🤜💨🧹</b>",
      user: "User: {user}",
      reason: "Reason: {reason}",
      matched: "Matched: {value}",
      forwardSource: "Forwarded from: {value}",
      links: "Links: {value}",
      contentTitle: "Message content:",
      nonTextMessage: "[non-text message]"
    },
    userReport: {
      title: "<b>User spam report</b>",
      target: "Target: {user}",
      usage: "Reply to the message you want to report with <code>/report</code>."
    }
  }
};

translations.vi.support = {
  title: "<b>Yêu cầu hỗ trợ từ member</b>",
  requester: "Người gửi: {user}",
  groupQuery: "Nhóm: {group}",
  groupMatches: "Nhóm bot tìm thấy:\n{groups}",
  noGroupMatches: "Không tìm thấy nhóm phù hợp",
  contentTitle: "Vấn đề:",
  usage: "Dùng <code>/support</code> trong chat riêng với bot để bắt đầu gửi yêu cầu hỗ trợ.",
  askLanguage:
    "Chọn ngôn ngữ / Choose language:\n<code>vi</code> - Tiếng Việt\n<code>en</code> - English",
  askGroup: "Hãy nhập tên nhóm bạn cần hỗ trợ.",
  groupNotFound: "Bot không tìm thấy nhóm phù hợp. Hãy nhập lại tên nhóm chính xác hơn.",
  askDetails: "Hãy mô tả vấn đề bạn đang gặp.",
  rateLimited: "Bạn chỉ có thể gửi tối đa {limit} yêu cầu hỗ trợ trong 24 giờ.",
  sent: "Đã lưu yêu cầu hỗ trợ. Admin sẽ xem xét."
};

translations.vi.supportResolution = {
  unlock: "Admin đã xử lý yêu cầu hỗ trợ của bạn: đã mở khóa chat trong nhóm <b>{group}</b>.",
  unban: "Admin đã xử lý yêu cầu hỗ trợ của bạn: đã gỡ ban trong nhóm <b>{group}</b>.",
  unbanWithLink:
    "Admin đã xử lý yêu cầu hỗ trợ của bạn: đã gỡ ban trong nhóm <b>{group}</b>.\nBạn có thể tham gia lại tại: {link}",
  ignore: "Admin đã xử lý yêu cầu hỗ trợ của bạn: admin đã kệ mịa bạn."
};

translations.en.support = {
  title: "<b>Member support request</b>",
  requester: "Requester: {user}",
  groupQuery: "Group: {group}",
  groupMatches: "Matched groups:\n{groups}",
  noGroupMatches: "No matching configured group found",
  contentTitle: "Issue:",
  usage: "Use <code>/support</code> in a private chat with the bot to start a support request.",
  askLanguage:
    "Choose language / Chọn ngôn ngữ:\n<code>vi</code> - Tiếng Việt\n<code>en</code> - English",
  askGroup: "Enter the group name you need help with.",
  groupNotFound: "No matching group was found. Please enter the group name more accurately.",
  askDetails: "Describe the issue you are having.",
  rateLimited: "You can send up to {limit} support requests every 24 hours.",
  sent: "Support request saved. Admins will review."
};

translations.en.supportResolution = {
  unlock: "An admin handled your support request: chat permission was restored in <b>{group}</b>.",
  unban: "An admin handled your support request: you were unbanned from <b>{group}</b>.",
  unbanWithLink:
    "An admin handled your support request: you were unbanned from <b>{group}</b>.\nYou can join again here: {link}",
  ignore: "An admin handled your support request: the request was ignored."
};

const normalizeLanguage = (language) =>
  SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;

const getValue = (language, key) =>
  key.split(".").reduce((value, part) => value?.[part], translations[normalizeLanguage(language)]);

const t = (language, key, params = {}) => {
  const template = getValue(language, key) ?? getValue(DEFAULT_LANGUAGE, key) ?? key;
  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );
};

module.exports = {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  normalizeLanguage,
  t
};
