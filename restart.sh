pm2 stop anti-spam-bot || true
pm2 delete anti-spam-bot || true
sleep 0.5
pm2 start ecosystem.config.js
pm2 save

# chmod +x ./restart.sh