// Cấu hình PM2 để chạy bot ở môi trường production.
module.exports = {
  apps: [
    {
      name: "anti-spam-bot",
      script: "./src/index.js"
    }
  ]
};
