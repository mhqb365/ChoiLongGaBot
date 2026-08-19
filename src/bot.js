const { createBotController } = require("./controllers/bot.controller.js");

// Giữ lớp bot mỏng để controller chịu trách nhiệm điều phối nghiệp vụ.
module.exports = {
  createBot: createBotController
};
