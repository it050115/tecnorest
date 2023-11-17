#! /bin/bash
echo “Starting Tecnorest deployment on Linux...”
cd /local/tecnorest/
pm2 stop tecnorest
sleep 1
# git config pull.rebase true
git pull origin master
sleep 1
# pm2 start ecosystem.config.js --env production --name "restbox"
pm2 start tecnorest
sleep 1
tail -f /var/log/tecnorest.log