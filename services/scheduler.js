const log = require("../util/log")(__filename)
const Cron = require("../util/Cron")
const certbot = require("../jobs/certbot/agent")
const jira = require("../jobs/jira/agent")
//const cdcLink = require("../jobs/cdc/agent")
//const testLink = require("../jobs/test/agent")

async function initialize() {
	log.info("Scheduler initialized")

	if (process.env.NODE_ENV === "production") {
		// PRODUCTION MODE
		//const certbotCron = new Cron("0 0 1 * *", "/CERTBOT/", certbot.renew)
		//const cdcCron = new Cron("*/3 8-19 * * 1-5", "/CDC/", cdcLink.importTicket)
		//certbotCron.start()
	} else {
		//await jira.runJobs()
		//await certbot.renew()
		//testLink.testProjection()
	}
}
module.exports.initialize = initialize

async function close() {
	log.info("Scheduler closed")
}

module.exports.close = close
