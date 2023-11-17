const path = require("path")
const config = require("../config/environment.js")()
const { createLogger, format, transports, verbose } = require("winston")
const { combine, timestamp, printf } = format
const DailyRotateFile = require("winston-daily-rotate-file")
//const logsDir = path.dirname(__filename)

const fileFormat = printf(({ level, message, timestamp, ...metadata }) => {
	let msg = `${timestamp} [${level}] ${message}`
	if (metadata && metadata.filename) msg += ` (${metadata.filename})`
	return msg
})

const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
	let msg = `${timestamp} [${level}] ${message}`
	let col = process.stdout.columns || 0
	if (metadata && metadata.filename) msg += ` (${metadata.filename})` //.padStart(col - msg.length + 5)
	return msg
})

const logger = createLogger({
	level: "silly",
	format: combine(timestamp({ format: "DD/MM/YYYY HH:mm:ss" }), fileFormat),
	transports: [
		new DailyRotateFile({
			filename: path.resolve(config.logPath, "tecnorest-%DATE%.log"),
			//datePattern: "YYYY-MM-DD",
			zippedArchive: true,
			//frequency: "5m",
			maxSize: "20m",
			createSymlink: true,
			symlinkName: config.logFile,
			handleExceptions: true,
		}),
		new transports.Console({
			format: combine(format.colorize(), timestamp({ format: "DD/MM/YYYY HH:mm:ss.SSS" }), consoleFormat),
		}),
	],
	exitOnError: false,
})

module.exports = function (f) {
	let filename = path.basename(f, ".js")
	var myLogger = {
		trace: function (text, err) {
			logger.error(text, { filename })
			logger.debug(err.stack)
		},
		error: function (text) {
			logger.error(text, { filename })
		},
		warn: function (text) {
			logger.warn(" " + text, { filename })
		},
		info: function (text) {
			logger.info(" " + text, { filename })
		},
		http: function (text) {
			logger.http(" " + text)
		},
		verbose: function (text) {
			logger.verbose(text, { filename })
		},
		debug: function (text) {
			logger.debug(text, { filename })
		},
		silly: function (text) {
			logger.silly(text, { filename })
		},
		log: function (level, text) {
			logger.log(level, text, { filename })
		},
		dir: function (obj) {
			logger.debug(JSON.stringify(obj))
		},
		dump: function (err) {
			if (typeof err === "object") {
				if (err.message) {
					logger.error("Message: " + err.message)
				}
				if (err.stack) {
					logger.debug("Stacktrace:\n" + err.stack)
				}
			} else {
				logger.warn(" argument is not an object", { filename })
			}
		},
		console: function (obj) {
			console.dir(obj)
		},
	}

	return myLogger
}
