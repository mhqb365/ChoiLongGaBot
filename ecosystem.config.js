// Cấu hình PM2 để chạy bot ở môi trường production.
module.exports = {
  apps: [
    {
      name: "ChoiLongGaBot",
      script: "./src/index.js"
    }
  ]
};
