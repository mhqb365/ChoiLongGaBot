// Escape HTML tối thiểu cho parse_mode HTML của Telegram.
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

module.exports = {
  escapeHtml
};
