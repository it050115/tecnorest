const log = require("../util/log")(__filename)
const config = require("../config/environment.js")()
const redis = require("redis")
const RedisStore = require("connect-redis").default

let redisClient,
	redisStore,
	maxRetry = 3

;(async () => {
	let retry = 0

	redisClient = redis.createClient({
		url: config.redis.url,
	})

	redisStore = new RedisStore({
		client: redisClient,
	})

	//redisClient.on("connect", () => log.info(`Connecting to ${config.redis.url}`))
	redisClient.on("ready", () => {
		log.info("RedisDB  is ready")
	})
	redisClient.on("end", () => log.info(`RedisDB disconnected`))

	redisClient.on("error", (error) => {
		log.error(`Redis: ${error}`)
		if (error.toString().search("Connection timeout") == -1 || error.toString().search("EHOSTUNREACH") == -1) {
			retry++
			if (retry >= maxRetry) {
				redisClient.disconnect()
				log.warn(`Redis server down or unrechable after 3 retry`)
			}
		}
	})
})()

async function initialize() {
	log.info(`Connecting to ${config.redis.url}`)
	redisClient.connect()
	//await redisClient.del("agents") //debug
}

async function close() {
	if (redisClient.isOpen) {
		await redisClient.disconnect()
	} else {
		log.warn("RedisDB may not be running")
	}
}

module.exports = { redisClient, redisStore, initialize, close }
