const dns = require("node:dns");
const mongoose = require("mongoose");

const { toBanLog } = require("./ban-log.js");
const {
  BanLog,
  ChatSettings,
  FilterRule,
  Keyword,
  PendingVerification,
  SupportRequest,
  SupportSession,
  TrackedMessage,
  UnbanLog,
  UserWarning,
  VerificationStatus
} = require("../models/index.js");

// Kết nối MongoDB và khởi tạo index trước khi bot xử lý update.
const connect = async ({ mongoUri, mongoDb, mongoDnsServers }) => {
  if (mongoUri.startsWith("mongodb+srv://") && mongoDnsServers.length > 0) {
    dns.setServers(mongoDnsServers);
  }

  await mongoose.connect(mongoUri, {
    dbName: mongoDb
  });

  await Promise.all([
    Keyword.init(),
    FilterRule.init(),
    ChatSettings.init(),
    BanLog.init(),
    PendingVerification.init(),
    SupportRequest.init(),
    SupportSession.init(),
    TrackedMessage.init(),
    UnbanLog.init(),
    UserWarning.init(),
    VerificationStatus.init()
  ]);
};

const normalizeCommandReplyDeleteSeconds = (seconds) =>
  Number.isInteger(seconds) ? Math.min(Math.max(seconds, 1), 60) : 3;

const normalizeMemberVerificationTimeoutMinutes = (minutes) =>
  Number.isInteger(minutes) ? Math.min(Math.max(minutes, 1), 60) : 1;

// Kho dữ liệu là lớp API duy nhất mà controller/service dùng.
const createStore = async (config) => {
  await connect(config);

  return {
    async addKeyword(chatId, keyword) {
      try {
        const result = await Keyword.updateOne(
          { chatId, keyword },
          { $setOnInsert: { chatId, keyword } },
          { upsert: true }
        );
        return result.upsertedCount > 0;
      } catch (error) {
        if (error?.code === 11000) {
          return false;
        }

        throw error;
      }
    },

    async removeKeyword(chatId, keyword) {
      const result = await Keyword.deleteOne({ chatId, keyword });
      return result.deletedCount > 0;
    },

    async listKeywords(chatId) {
      return Keyword.find({ chatId }).sort({ keyword: 1 }).lean();
    },

    async countKeywords(chatId) {
      return Keyword.countDocuments({ chatId });
    },

    async addFilterRule(chatId, trigger, replyText) {
      try {
        const result = await FilterRule.updateOne(
          { chatId, trigger },
          { $set: { replyText }, $setOnInsert: { chatId, trigger } },
          { upsert: true }
        );
        return result.upsertedCount > 0 || result.modifiedCount > 0;
      } catch (error) {
        if (error?.code === 11000) {
          await FilterRule.updateOne(
            { chatId, trigger },
            { $set: { replyText } }
          );
          return false;
        }

        throw error;
      }
    },

    async removeFilterRule(chatId, trigger) {
      const result = await FilterRule.deleteOne({ chatId, trigger });
      return result.deletedCount > 0;
    },

    async listFilterRules(chatId) {
      return FilterRule.find({ chatId }).sort({ trigger: 1 }).lean();
    },

    async countFilterRules(chatId) {
      return FilterRule.countDocuments({ chatId });
    },

    async clearFilterRules(chatId) {
      const result = await FilterRule.deleteMany({ chatId });
      return result.deletedCount;
    },

    async clearKeywords(chatId) {
      const result = await Keyword.deleteMany({ chatId });
      return result.deletedCount;
    },

    async incrementWarning(chatId, userId, metadata = {}) {
      return UserWarning.findOneAndUpdate(
        { chatId, userId },
        {
          $set: {
            lastReason: metadata.reason ?? "",
            lastMatchedKeyword: metadata.matchedKeyword ?? ""
          },
          $setOnInsert: { chatId, userId },
          $inc: { count: 1 }
        },
        { new: true, upsert: true }
      ).lean();
    },

    async clearWarnings(chatId, userId) {
      await UserWarning.deleteOne({ chatId, userId });
    },

    async trackMessage(message) {
      if (!message?.chat?.id || !message.from?.id || !message.message_id) {
        return;
      }

      // Lưu message theo user để /clean có thể dọn các tin gần đây của người đó.
      await TrackedMessage.updateOne(
        { chatId: message.chat.id, messageId: message.message_id },
        {
          $set: {
            chatId: message.chat.id,
            userId: message.from.id,
            messageId: message.message_id
          }
        },
        { upsert: true }
      );
    },

    async listTrackedMessageIds(chatId, userId) {
      const rows = await TrackedMessage.find({ chatId, userId })
        .sort({ messageId: -1 })
        .select({ messageId: 1, _id: 0 })
        .lean();
      return rows.map((row) => row.messageId);
    },

    async removeTrackedMessages(chatId, messageIds) {
      if (messageIds.length === 0) {
        return;
      }

      await TrackedMessage.deleteMany({
        chatId,
        messageId: { $in: messageIds }
      });
    },

    async getChatSettings(chatId) {
      const settings = await ChatSettings.findOne({ chatId }).lean();
      const commandReplyDeleteSeconds = normalizeCommandReplyDeleteSeconds(
        settings?.commandReplyDeleteSeconds
      );
      const memberVerificationTimeoutMinutes = normalizeMemberVerificationTimeoutMinutes(
        settings?.memberVerificationTimeoutMinutes
      );
      const banLinkSenders = settings?.banLinkSenders ?? false;
      const banStorySenders = settings?.banStorySenders ?? false;
      return {
        cleanServiceMessages: settings?.cleanServiceMessages ?? false,
        cleanLinkMessages: banLinkSenders ? false : (settings?.cleanLinkMessages ?? false),
        banLinkSenders,
        cleanStoryMessages: banStorySenders ? false : (settings?.cleanStoryMessages ?? false),
        banStorySenders,
        memberVerificationEnabled: settings?.memberVerificationEnabled ?? false,
        memberVerificationTimeoutMinutes,
        memberVerificationTimeoutMs: memberVerificationTimeoutMinutes * 60 * 1000,
        commandReplyDeleteSeconds,
        commandReplyDeleteMs: commandReplyDeleteSeconds * 1000,
        language: settings?.language ?? "en"
      };
    },

    async ensureChatSettings(chatId) {
      await ChatSettings.updateOne({ chatId }, { $setOnInsert: { chatId } }, { upsert: true });
    },

    async deleteChatData(chatId) {
      await Promise.all([
        BanLog.deleteMany({ chatId }),
        ChatSettings.deleteOne({ chatId }),
        FilterRule.deleteMany({ chatId }),
        Keyword.deleteMany({ chatId }),
        PendingVerification.deleteMany({ chatId }),
        SupportRequest.deleteMany({ "matchedChats.chatId": chatId }),
        TrackedMessage.deleteMany({ chatId }),
        UnbanLog.deleteMany({ chatId }),
        UserWarning.deleteMany({ chatId }),
        VerificationStatus.deleteMany({ chatId })
      ]);
    },

    async listConfiguredChatIds() {
      const chatIds = await Promise.all([
        ChatSettings.distinct("chatId"),
        FilterRule.distinct("chatId"),
        Keyword.distinct("chatId"),
        BanLog.distinct("chatId")
      ]);
      return [...new Set(chatIds.flat())].sort((left, right) => right - left);
    },

    async setCleanServiceMessages(chatId, enabled) {
      await ChatSettings.updateOne(
        { chatId },
        { $set: { chatId, cleanServiceMessages: enabled } },
        { upsert: true }
      );
    },

    async setCleanLinkMessages(chatId, enabled) {
      await ChatSettings.updateOne(
        { chatId },
        { $set: { chatId, cleanLinkMessages: enabled } },
        { upsert: true }
      );
    },

    async setBanLinkSenders(chatId, enabled) {
      await ChatSettings.updateOne(
        { chatId },
        { $set: { chatId, banLinkSenders: enabled } },
        { upsert: true }
      );
    },

    async setCleanStoryMessages(chatId, enabled) {
      await ChatSettings.updateOne(
        { chatId },
        { $set: { chatId, cleanStoryMessages: enabled } },
        { upsert: true }
      );
    },

    async setBanStorySenders(chatId, enabled) {
      await ChatSettings.updateOne(
        { chatId },
        { $set: { chatId, banStorySenders: enabled } },
        { upsert: true }
      );
    },

    async setMemberVerificationEnabled(chatId, enabled) {
      await ChatSettings.updateOne(
        { chatId },
        { $set: { chatId, memberVerificationEnabled: enabled } },
        { upsert: true }
      );
    },

    async setMemberVerificationTimeoutMinutes(chatId, minutes) {
      await ChatSettings.updateOne(
        { chatId },
        { $set: { chatId, memberVerificationTimeoutMinutes: minutes } },
        { upsert: true }
      );
    },

    async setCommandReplyDeleteSeconds(chatId, seconds) {
      await ChatSettings.updateOne(
        { chatId },
        { $set: { chatId, commandReplyDeleteSeconds: seconds } },
        { upsert: true }
      );
    },

    async savePendingVerification(payload) {
      await VerificationStatus.updateOne(
        { chatId: payload.chatId, userId: payload.userId },
        {
          $set: {
            chatId: payload.chatId,
            userId: payload.userId,
            status: "pending",
            expiresAt: payload.expiresAt,
            attempts: payload.attempts ?? 0,
            updatedBy: "system"
          }
        },
        { upsert: true }
      );
      await PendingVerification.updateOne(
        { chatId: payload.chatId, userId: payload.userId },
        { $set: payload },
        { upsert: true }
      );
    },

    async getPendingVerification(chatId, userId, token) {
      return PendingVerification.findOne({ chatId, userId, token }).lean();
    },

    async getPendingVerificationByUser(chatId, userId) {
      return PendingVerification.findOne({ chatId, userId }).lean();
    },

    async deletePendingVerification(chatId, userId) {
      await PendingVerification.deleteOne({ chatId, userId });
    },

    async setVerificationStatus(chatId, userId, status, payload = {}) {
      await VerificationStatus.updateOne(
        { chatId, userId },
        {
          $set: {
            chatId,
            userId,
            status,
            expiresAt: payload.expiresAt ?? null,
            attempts: payload.attempts ?? 0,
            updatedBy: payload.updatedBy ?? "system"
          }
        },
        { upsert: true }
      );
    },

    async getVerificationStatus(chatId, userId) {
      return VerificationStatus.findOne({ chatId, userId }).lean();
    },

    async incrementPendingVerificationAttempts(chatId, userId) {
      const pending = await PendingVerification.findOneAndUpdate(
        { chatId, userId },
        { $inc: { attempts: 1 } },
        { new: true }
      ).lean();
      if (pending) {
        await VerificationStatus.updateOne(
          { chatId, userId },
          {
            $set: {
              chatId,
              userId,
              status: "pending",
              expiresAt: pending.expiresAt,
              attempts: pending.attempts,
              updatedBy: "system"
            }
          },
          { upsert: true }
        );
      }
      return pending;
    },

    async listExpiredPendingVerifications(now, limit = 50) {
      return PendingVerification.find({ expiresAt: { $lte: now } })
        .sort({ expiresAt: 1 })
        .limit(limit)
        .lean();
    },

    async setLanguage(chatId, language) {
      await ChatSettings.updateOne({ chatId }, { $set: { chatId, language } }, { upsert: true });
    },

    async recordBanLog(payload) {
      const banLog = toBanLog(payload);
      await BanLog.create(banLog);
      return banLog;
    },

    async recordSupportRequest(payload) {
      return SupportRequest.create(payload);
    },

    async recordUnbanLog(payload) {
      return UnbanLog.create(payload);
    },

    async countRecentSupportRequests(userId, since) {
      return SupportRequest.countDocuments({
        "requester.id": userId,
        createdAt: { $gte: since }
      });
    },

    async saveSupportSession(userId, payload) {
      return SupportSession.findOneAndUpdate(
        { userId },
        { $set: { ...payload, userId } },
        { new: true, upsert: true }
      ).lean();
    },

    async getSupportSession(userId) {
      return SupportSession.findOne({ userId }).lean();
    },

    async deleteSupportSession(userId) {
      await SupportSession.deleteOne({ userId });
    },

    async getSupportModerationContext(chatIds, userId) {
      if (chatIds.length === 0 || !userId) {
        return [];
      }

      const [warnings, banLogs] = await Promise.all([
        UserWarning.find({ chatId: { $in: chatIds }, userId }).lean(),
        BanLog.find({ chatId: { $in: chatIds }, userId })
          .sort({ createdAt: -1 })
          .lean()
      ]);
      const warningsByChatId = new Map(warnings.map((warning) => [warning.chatId, warning]));
      const banLogsByChatId = new Map();

      for (const banLog of banLogs) {
        const rows = banLogsByChatId.get(banLog.chatId) ?? [];
        rows.push(banLog);
        banLogsByChatId.set(banLog.chatId, rows);
      }

      return chatIds.map((chatId) => {
        const chatBanLogs = banLogsByChatId.get(chatId) ?? [];
        const latestBan = chatBanLogs[0];
        return {
          chatId,
          warningCount: warningsByChatId.get(chatId)?.count ?? 0,
          latestWarningReason: warningsByChatId.get(chatId)?.lastReason,
          latestWarningAt: warningsByChatId.get(chatId)?.updatedAt,
          latestWarningMatchedKeyword: warningsByChatId.get(chatId)?.lastMatchedKeyword,
          banCount: chatBanLogs.length,
          latestBanReason: latestBan?.reason,
          latestBanAt: latestBan?.createdAt,
          latestMatchedKeyword: latestBan?.matchedKeyword
        };
      });
    },

    async listSupportRequests(chatId, limit = 30) {
      return SupportRequest.find({ "matchedChats.chatId": chatId, status: "pending" })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    },

    async getSupportRequestForChat(requestId, chatId) {
      return SupportRequest.findOne({ _id: requestId, "matchedChats.chatId": chatId }).lean();
    },

    async resolveSupportRequest(requestId, chatId, payload) {
      return SupportRequest.findOneAndUpdate(
        { _id: requestId, "matchedChats.chatId": chatId },
        {
          $set: {
            status: "resolved",
            resolutionAction: payload.action,
            resolvedAt: new Date(),
            resolvedBy: payload.resolvedBy,
            resolutionMessage: payload.message
          }
        },
        { new: true }
      ).lean();
    },

    async countBannedUsers(chatId) {
      const userIds = await BanLog.distinct("userId", { chatId });
      const [loggedUnbannedUserIds, supportUnbannedUserIds] = await Promise.all([
        UnbanLog.distinct("userId", { chatId }),
        SupportRequest.distinct("requester.id", {
          "matchedChats.chatId": chatId,
          resolutionAction: "unban",
          status: "resolved"
        })
      ]);
      const unbannedUserIds = new Set([...loggedUnbannedUserIds, ...supportUnbannedUserIds]);
      return userIds.filter((userId) => !unbannedUserIds.has(userId)).length;
    },

    async countUnbannedUsers(chatId) {
      const [loggedUnbannedUserIds, supportUnbannedUserIds] = await Promise.all([
        UnbanLog.distinct("userId", { chatId }),
        SupportRequest.distinct("requester.id", {
          "matchedChats.chatId": chatId,
          resolutionAction: "unban",
          status: "resolved"
        })
      ]);
      const userIds = new Set([...loggedUnbannedUserIds, ...supportUnbannedUserIds]);
      return userIds.size;
    },

    async close() {
      await mongoose.disconnect();
    }
  };
};

module.exports = {
  createStore
};
