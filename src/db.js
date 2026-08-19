const { createStore } = require("./db/store.js");

// Điểm xuất công khai cho tầng lưu trữ, tránh import sâu từ nơi khác trong app.
module.exports = {
  createStore
};
