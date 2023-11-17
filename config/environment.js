require("dotenv").config()

/**
 * linux cmd
 *    $ ssh -i /Users/it050382/.ssh/id_gcp admin_farina_crowdservices_it@35.195.208.175 (cs-mdb) / 35.240.39.28 (cs-ha01)
 *    $ tail -F /var/log/mongodb/mongod.log
 * momgodb server console on linux (for mongo shell)
 *    $ ssh -p 22 -R 27017:127.0.0.1:27017 -i /Users/it050382/.ssh/id_gcp admin_farina_crowdservices_it@35.195.208.175
 * mongodb tunnelled (for Rest Client and Compass)
 *    $ ssh -p 22 -N -L 27017:127.0.0.1:27017 -i /Users/it050382/.ssh/id_gcp admin_farina_crowdservices_it@35.195.208.175
 * mongodb client shell on MacOS (run tunnelled ssh connectiof first)
 *    $ mongo "mongodb://127.0.0.1:27017"
 * node syntax:
 *    $ node qrkweb/bin/www local|production
 * nodemon suntax:
 *    $ nodemon tecnorest/index local
 * pm2 syntax:
 *    $ pm2 start|stop|restart qrkweb/bin/www|id -- local|production
 *    es.: $ pm2 start /usr/src/node/qrkweb/bin/www -- local
 *    $ pm2 monit

bash
Bash as login shell will load /etc/profile, ~/.bash_profile, ~/.bash_login, ~/.profile in the order
Bash as non-login interactive shell will load ~/.bashrc
use [nano ~/.bash_profile] to edit
use [source ~/.bash_profile] to reload profile
use [echo $CS_USER to get variable value] */

const common = {
	access_token_secret: process.env.CS_JWT_SECRET,
	access_token_expiration: 900, // 15 min
	refresh_token_secret: process.env.CS_REFRESH_JWT_SECRET,
	refresh_token_expiration: 60 * 60 * 24 * 7, // last=number of days  //604800, // 7 days
	session_secret: process.env.CS_SES_SECRET,
	cookie_secret: process.env.CS_COOKIE_SECRET,
	keyFile: process.env.CS_GOOGLE_SERVICE_ACCOUNT,
	adminKeyFile: process.env.GC_GOOGLE_SERVICE_ACCOUNT,
	whitelist: ["http://localhost:3000", "http://localhost:5000", "https://portal.crowdservices.it", "https://portaltest.crowdservices.it"],
	permissionLevels: {
		NORMAL_USER: 1,
		PAID_USER: 4,
		ADMIN: 2048,
	},
}

const google = {
	clientID: process.env.CS_GOOGLE_CLIENT_ID,
	clientSecret: process.env.CS_GOOGLE_CLIENT_SECRET,
	callbackURL: process.env.CS_GOOGLE_CALLBACK_URL,
	mapKey: process.env.CS_GOOGLE_MAP_KEY,
}

const oracle = {
	ocOnItor01: {
		user: process.env.OC_USER,
		password: process.env.OC_PASSWORD,
		connectString: process.env.OC_CONNECTSTRING,
		poolMin: 1,
		poolMax: 10,
		poolIncrement: 1,
		enableStatistics: true, //true for statistics
	},
	csOnItor03: {
		user: process.env.CS_USER,
		password: process.env.CS_PASSWORD,
		connectString: process.env.CS_CONNECTSTRING,
		poolMin: 1,
		poolMax: 10,
		poolIncrement: 1,
	},
	xagentOnItor01: {
		user: process.env.XAGENT_USER,
		password: process.env.XAGENT_PASSWORD,
		connectString: process.env.XAGENT_CONNECTSTRING,
		poolMin: 1,
		poolMax: 10,
		poolIncrement: 1,
	},
}

const mongo = {
	mdbOnCsMdb: "mongodb://35.195.208.175:27017/crowd",
	mdbOnDmz: process.env.MDB_ON_DMZ,
	mdbOnLocal: "mongodb://localhost:27017/crowd",
	//kontact: "mongodb://qrkontact:Warn1ngs$$4@127.0.0.1:27017/qrkontact",
}

const mssql = {
	mssqlOnCs: {
		hda: {
			server: process.env.HDA_SERVER,
			database: process.env.HDA_NAME,
			user: process.env.HDA_USER,
			password: process.env.HDA_PWD,
			pool: {
				max: 5,
				min: 1,
				idleTimeoutMillis: 3000,
			},
			options: {
				encrypt: true,
				trustServerCertificate: true,
			},
		},
		mago: {
			server: process.env.MAGO_SERVER,
			database: process.env.MAGO_NAME,
			user: process.env.MAGO_USER,
			password: process.env.MAGO_PWD,
			pool: {
				max: 10,
				min: 1,
				idleTimeoutMillis: 3000,
			},
			options: {
				encrypt: true,
				trustServerCertificate: true, // change to true for local dev / self-signed certs
			},
		},
	},
}

const hda = {
	hostname: process.env.WSC_HOSTNAME,
	username: process.env.WSC_USERNAME,
	password: process.env.WSC_PASSWORD,
}

const proxy = {
	host: process.env.HAP_HOST,
	port: process.env.HAP_PORT,
	username: process.env.HAP_USER,
	privateKey: process.env.HAP_PRIVATEKEY,
	password: process.env.ROOT_PSW,
}

const redis = {
	url: process.env.CS_REDIS_SERVER,
}

const config = {
	development: {
		mode: "development",
		port: 5000,
		apiPath: "/api/v1",
		logPath: "log",
		logFile: "tecnorest.log",
		filePath: "files/",
		rootPath: "/Users/it050382/Node",
		publicPath: "/crowd-portal/public",
		oraclePool: oracle.ocOnItor01,
		mongoPool: mongo.mdbOnCsMdb,
		mssqlPool: mssql.mssqlOnCs,
		google: google,
		wsc: hda,
		ha: proxy,
		redis: redis,
		common: common,
	},
	production: {
		mode: "production",
		port: 5000,
		apiPath: "/api/v1",
		logPath: "/var/log",
		logFile: "tecnorest.log",
		filePath: "/local/tmp/",
		rootPath: "/local",
		publicPath: "/crowd-portal/build",
		oraclePool: oracle.ocOnItor01,
		mongoPool: mongo.mdbOnDmz,
		mssqlPool: mssql.mssqlOnCs,
		google: google,
		wsc: hda,
		ha: proxy,
		redis: redis,
		common: common,
	},
}

module.exports = function (mode) {
	return config[mode || process.env.NODE_ENV || process.argv[2] || "production"] || config.production
}
