# Tecnorest API Gateway

SCAI Tecno Portal API server. Visit https://www.grupposcai.it

## Nodemon

To run the project, please use the following command line:

-  `npm run [dev/prod] (default: prod)`

   -  It will run the server at port 4000.

## PM2

To build and run the project, please use the following commands:

-  pm2 <start/stop/delete> <process id/process name>
-  pm2 start ecosystem.config.js --env production --name "restbox"
-  linux cmd
-  $ ssh -i /Users/it050382/.ssh/id_gcp admin_farina_grupposcai_it@35.195.208.175 (mdb)
-  $ ssh -i /Users/it050382/.ssh/id_gcp admin_farina_grupposcai_it@35.240.39.28 (ha01)
-  $ tail -F /var/log/mongodb/mongod.log
-  momgodb server console on linux (for mongo shell)
-  $ ssh -p 22 -R 27017:127.0.0.1:27017 -i /Users/it050382/.ssh/id_gcpadmin_farina_grupposcai_it@35.195.208.175
-  mongodb tunnelled (for Rest Client and Compass)
-  $ ssh -p 22 -N -L 27017:127.0.0.1:27017 -i /Users/it050382/.ssh/id_gcp admin_farina_grupposcai_it@35.195.208.175
-  Mounting Linux file system on MAC (https://phoenixnap.com/kb/sshfs)
-  $ sudo sshfs -o allow_other,IdentityFile=/Users/it050382/.ssh/id_gcpadmin_farina_grupposcai_it@35.195.208.175:/local/ /private/mdb/
-  $ sudo umount /private/`mdb`
-  mongodb client shell on MacOS (run tunnelled ssh connectiof first)
-  $ mongo "mongodb://127.0.0.1:27017"
-  node syntax:
-  $ node qrkweb/bin/www local|production
-  nodemon suntax:
-  $ nodemon restbox/index local
-  pm2 syntax:
-  $ pm2 start|stop|restart qrkweb/bin/www|id -- local|production
-  es.: $ pm2 start "npm run prod" --name restbox
-  pm2 start /usr/src/node/qrkweb/bin/www -- local
-  $ pm2 monit
-  https://www.loginradius.com/blog/engineering/react-app-deployment/

## Environment

Show

-  env or printenv
-  echo $variablename

Edit

Bash as login shell will load /etc/profile, ~/.bash_profile, ~/.bash_login, ~/.profile in the order

Bash as non-login interactive shell will load ~/.bashrc

-  use nano ~/.bash_profile on Mac and Linux

Reload

-  source ~/.bash_profile
