// Các field đặc trưng của service message Telegram cần dọn khi bật /cleanservice.
const SERVICE_MESSAGE_FIELDS = [
  "new_chat_members",
  "left_chat_member",
  "new_chat_title",
  "new_chat_photo",
  "delete_chat_photo",
  "group_chat_created",
  "supergroup_chat_created",
  "channel_chat_created",
  "message_auto_delete_timer_changed",
  "migrate_to_chat_id",
  "migrate_from_chat_id",
  "pinned_message",
  "proximity_alert_triggered",
  "video_chat_scheduled",
  "video_chat_started",
  "video_chat_ended",
  "video_chat_participants_invited",
  "forum_topic_created",
  "forum_topic_edited",
  "forum_topic_closed",
  "forum_topic_reopened",
  "general_forum_topic_hidden",
  "general_forum_topic_unhidden",
  "giveaway_created",
  "giveaway_completed",
  "boost_added",
  "chat_background_set"
];

const isServiceMessage = (message) =>
  SERVICE_MESSAGE_FIELDS.some((field) => Object.hasOwn(message, field));

module.exports = {
  isServiceMessage
};
