require("dotenv").config()
const config = require("./config/environment.js")()
const log = require("./util/log")(__filename)
const server = require("./services/server.js")
const scheduler = require("./services/scheduler")

log.info(`Starting Tecnorest API Gateway in ${config.mode} mode. NODE_ENV: ${process.env.NODE_ENV}`)

async function startup() {
	/*
	try {
		oracle.initialize()
	} catch (err) {
		log.error(err)

		process.exit(1)
	}*/

	try {
		server.initialize()
	} catch (err) {
		log.error(err)

		process.exit(1)
	}

	try {
		scheduler.initialize()
		server.app.emit("Server ready")
	} catch (err) {
		log.error(err)

		process.exit(1)
	}
}

startup()

async function shutdown(e) {
	log.warn("Shutting down now!")
	let err = e

	try {
		await server.close()
	} catch (err) {
		log.error("Server may not be running", e)
		err = err || e
	}

	try {
		await scheduler.close()
	} catch (err) {
		log.error("Scheduler may not be running", e)
		err = err || e
	}

	/*
	try {
		await oracle.close()
	} catch (err) {
		log.error("OracleDB may not be running", err)
		err = err || e
	}*/

	if (err) {
		log.warn("Exiting process with errors")
		process.exit(1) // Non-zero failure code
	} else {
		log.info("Exiting process")
		process.exit(0)
	}
}

process.on("SIGTERM", () => {
	log.warn("Received SIGTERM")
	shutdown()
})

process.on("SIGINT", () => {
	log.warn("Received SIGINT")
	shutdown()
	/*
	gracefulShutdown((err) => {
     process.exit(err ? 1 : 0)
   })*/
})

process.on("uncaughtException", (err) => {
	log.warn("Uncaught Exception")
	//log.error(err)
	log.dump(err)
})
