const log = require("../util/log")(__filename)
const path = require("path")
const http = require("http")
const requestCountry = require("request-country")
const parser = require("ua-parser-js")
const express = require("express")
//const flash = require("connect-flash")
//const helmet = require("helmet")
const { rateLimit } = require("express-rate-limit")
const session = require("express-session")
const passport = require("passport")
const cors = require("cors")
const morgan = require("morgan")
const favicon = require("serve-favicon")
const config = require("../config/environment.js")()

const app = express()
app.set("trust proxy", 1)

let httpServer

const initialize = async () => {
	/**
      Combines logging info from request and response
      By default, morgan streams log info to STDOUT (which is displayed in the terminal).
      app.use(morgan("combined")) 
      We merge into standard log file instead and combine with usa parser to get detailed info

		Standard Apache combined log output.
		:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"

		Standard Apache common log output.
		:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]

		dev
		:method :url :status :response-time ms - :res[content-length]

		Shorter than default, also including response time.
		:remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
		
		tiny - The minimal output.
		:method :url :status :res[content-length] - :response-time ms
    */
	morgan.token("user-agent", function (req, res) {
		const ua = parser(req.headers["user-agent"])
		let ct = requestCountry(req)
		if (ct == false) ct = "Unknow"
		if (ua.browser.name === undefined) return req.headers["user-agent"] + " (" + ct + ")"
		return ua.browser.name + " " + ua.browser.version + " " + ua.engine.name + "/" + ua.os.name + " " + ua.os.version + " (" + ct + ")"
	})
	const custom = ':method [:status] :url :remote-addr :res[content-length] :remote-user ":referrer" ":user-agent" :response-time ms'
	app.use(
		morgan(custom, {
			stream: {
				write: (message) => log.http(message.replace(/^\s+|\s+$/g, "")),
			},
			skip: (req, res) => {
				return req.headers["user-agent"] == "GoogleHC/1.0"
				//return req.url == "/"
			},
		})
	)

	/** rateLimit
	 * https://www.npmjs.com/package/express-rate-limit
	 */
	const limiter = rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
		standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
		legacyHeaders: false, // Disable the `X-RateLimit-*` headers
		message: async (req, res) => {
			res.render("429", { message: `IP ${req.ip} was rate limited.` })
		},
		//store: new MemoryStore(),
		//store: redis.getStore()
		//store: redis.redisStore,
	})
	app.use(limiter)

	/** Configure session middleware and store
	 * https://medium.com/swlh/session-management-in-nodejs-using-redis-as-session-store-64186112aa9
	 * https://stackoverflow.com/questions/76539488/express-error-connectredis-is-not-a-function-solved-the-problem-by-installi
	 */
	app.use(
		session({
			//store: mongo.getStore(),
			//store: redis.redisStore,
			secret: config.common.session_secret,
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: false, // if true only transmit cookie over https
				httpOnly: false, // if true prevent client side JS from reading the cookie
				maxAge: 1000 * 60 * 10, // session max age in miliseconds
			},
		})
	)

	//app.use(flash())

	app.use(passport.initialize())
	app.use(passport.session())
	app.use(passport.authenticate("session"))

	log.info("Cookie session and Passport Authentication initialized")

	// DEBUG ALL ENV VARS
	// https://www.twilio.com/blog/working-with-environment-variables-in-node-js.html
	//console.debug(process.env)

	// Cross origin and request common vars
	app.use(
		"*",
		cors({
			origin: config.common.whitelist,
			methods: "GET,HEAD,POST,PATCH,PUT,DELETE",
			optionsSuccessStatus: 200,
			credentials: true,
		}),
		(req, res, next) => {
			//log.debug(req.socket.remoteAddress)
			//log.debug(req.headers["x-forwarded-for"])
			//log.debug(req.url)
			//global.host = req.headers.host
			//log.debug("origin: " + req.headers.host)
			//log.debug(res.statusCode)
			next()
		}
	)

	log.info("Security and Cross Origin settings applied to whitelisted hosts")

	// secure http channel
	app.disable("x-powered-by")

	// parse requests of content-type - application/json
	app.use(
		express.json({
			reviver: reviveJson,
		})
	)
	// parse requests of content-type - application/x-www-form-urlencoded
	app.use(
		express.urlencoded({
			extended: true,
		})
	)

	// serve the content of 'public' folder as static
	app.use(express.static(path.join(__dirname, "public")))

	// set favicon
	//app.use(favicon(path.join(__dirname, "../public", "favicon.ico")))

	// Mount the router at /api/v1 so all routes start with /api/v1
	//app.use(config.apiPath + "/oauth2", AuthRouter)

	// Send message for default URL
	app.get("/", (req, res, next) => {
		res.end("Welcome to Tecnorest!")
		next()
	})

	return new Promise((resolve, reject) => {
		httpServer = http.createServer(app)

		// start server
		httpServer.listen(config.port, (err) => {
			if (err) {
				reject(err)
				return
			}

			log.info("Server listening on port " + config.port)
			//app.emit("Server ready")
			resolve()
		})
	})
}

/**
 * Controlling the Shutdown
 * @returns
 */
function close() {
	//log.info("Closing Web server...")
	return new Promise((resolve, reject) => {
		httpServer.close((err) => {
			if (err) {
				reject(err)
				return
			}

			log.info("Web Server shutdown")
			resolve()
		})
	})
}
//module.exports.close = close

//Dates are not supported in JSON and typically need to be represented as ISO 8601 strings
const iso8601RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
function reviveJson(key, value) {
	// revive ISO 8601 date strings to instances of Date
	if (typeof value === `string` && iso8601RegExp.test(value)) {
		return new Date(value)
	} else {
		return value
	}
}

module.exports = { initialize, close, app }
