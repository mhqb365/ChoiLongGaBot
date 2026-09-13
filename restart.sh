pm2 stop ChoiLongGaBot || true
pm2 delete ChoiLongGaBot || true
sleep 0.5
pm2 start ecosystem.config.js
pm2 save

# chmod +x ./restart.sh