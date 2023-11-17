/**
 * ecosysstm.config.js works only in production where PM2 runs.
 * development environment not needed.
 */
module.exports = {
	apps: [
		{
			name: "tecnorest",
			script: "npm run prod",
			watch: false,
			env_development: {},
			env_production: {
				"PORT": 5000,
				"NODE_ENV": "production",
				"CS_REDIS_SERVER": "redis://127.0.0.1:6379",
				"APP_NAME": "prod",
				"CS_GOOGLE_CLIENT_ID": "255374985666-ja7vnf0i7jo4oaekkrf8pc9rtaac8hhc.apps.googleusercontent.com",
				"CS_GOOGLE_CLIENT_SECRET": "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",
				"CS_GOOGLE_CALLBACK_URL": "https://portal.crowdservices.it/api/v1/oauth2/redirect/google",
				"CS_GOOGLE_CALLBACK_LOOPBACK": "https://portaltest.crowdservices.it/api/v1/oauth2/redirect/google",
				"CS_GOOGLE_SERVICE_ACCOUNT": "/local/service-account/onecall-270815-1d4c6fecc7e3.json",
				"GC_GOOGLE_SERVICE_ACCOUNT": "/local/service-account/crowdservices-gest-a53798694b86.json",
				"CS_GOOGLE_MAP_KEY": "AIzaSyCmWi4Vd-ByyijUN6UP5vURfig75zTxl_I",
				"CS_SES_SECRET": "Fuckm3!!ifY0uC4n",
				"CS_JWT_SECRET": "Diagn0st1cs!!isAMess",
				"CS_COOKIE_SECRET": "aku77sdsf!Fuckm3",
				"CS_REFRESH_JWT_SECRET": "Warn1ng!!isBetter",
				"CS_USER": "cs",
				"CS_PASSWORD": "D1agn0st1cs",
				"CS_CONNECTSTRING": "104.155.19.113/CROWD.crowdservices.it",
				"XAGENT_USER": "xagent",
				"XAGENT_PASSWORD": "D1agn0st1cs",
				"XAGENT_CONNECTSTRING": "213.183.145.22/CROWD",
				"OC_USER": "oc",
				"OC_PASSWORD": "D1agn0st1cs",
				"OC_CONNECTSTRING": "213.183.145.22/CROWD",
				"MDB_ON_DMZ": "mongodb://cs-mdb:27017/crowd",
				"ROOT_PSW": "D1agn0st1csisamess",
			},
		},
	],
}
