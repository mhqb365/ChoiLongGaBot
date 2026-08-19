// Danh sách lệnh bot đang route trong bot.controller.js.
const COMMANDS = {
  report: "/report",
  support: "/support",
  id: "/id",
  clean: "/clean",
  status: "/status",
  lock: "/lock",
  unlock: "/unlock",
  ban: "/ban",
  unban: "/unban",
  warn: "/warn",
  unwarn: "/unwarn",
  active: "/active",
  deactive: "/deactive"
};

const COMMAND_GUIDE = [
  {
    command: COMMANDS.report,
    access: "member",
    descriptionKey: "commandReport",
    examples: [COMMANDS.report]
  },
  {
    command: COMMANDS.active,
    access: "admin",
    descriptionKey: "commandActive",
    examples: [COMMANDS.active]
  },
  {
    command: COMMANDS.deactive,
    access: "admin",
    descriptionKey: "commandDeactive",
    examples: [COMMANDS.deactive]
  },
  {
    command: COMMANDS.id,
    access: "admin",
    descriptionKey: "commandId",
    examples: [`${COMMANDS.id} username`, `${COMMANDS.id} @username`]
  },
  {
    command: COMMANDS.clean,
    access: "admin",
    descriptionKey: "commandClean",
    examples: [COMMANDS.clean, `${COMMANDS.clean} 123456789`, `${COMMANDS.clean} @username`]
  },
  {
    command: COMMANDS.status,
    access: "admin",
    descriptionKey: "commandStatus",
    examples: [COMMANDS.status, `${COMMANDS.status} 123456789`, `${COMMANDS.status} @username`]
  },
  {
    command: COMMANDS.lock,
    access: "admin",
    descriptionKey: "commandLock",
    examples: [
      COMMANDS.lock,
      `${COMMANDS.lock} 10m`,
      `${COMMANDS.lock} 123456789 2h`,
      `${COMMANDS.lock} @username 10m`
    ]
  },
  {
    command: COMMANDS.unlock,
    access: "admin",
    descriptionKey: "commandUnlock",
    examples: [COMMANDS.unlock, `${COMMANDS.unlock} 123456789`, `${COMMANDS.unlock} @username`]
  },
  {
    command: COMMANDS.ban,
    access: "admin",
    descriptionKey: "commandBan",
    examples: [COMMANDS.ban, `${COMMANDS.ban} 123456789`, `${COMMANDS.ban} @username`]
  },
  {
    command: COMMANDS.unban,
    access: "admin",
    descriptionKey: "commandUnban",
    examples: [COMMANDS.unban, `${COMMANDS.unban} 123456789`, `${COMMANDS.unban} @username`]
  },
  {
    command: COMMANDS.warn,
    access: "admin",
    descriptionKey: "commandWarn",
    examples: [COMMANDS.warn, `${COMMANDS.warn} 123456789`, `${COMMANDS.warn} @username`]
  },
  {
    command: COMMANDS.unwarn,
    access: "admin",
    descriptionKey: "commandUnwarn",
    examples: [COMMANDS.unwarn, `${COMMANDS.unwarn} 123456789`, `${COMMANDS.unwarn} @username`]
  }
];

module.exports = {
  COMMAND_GUIDE,
  COMMANDS
};
