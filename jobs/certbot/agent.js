const log = require("../../util/log")(__filename)
const config = require("../../config/environment.js")()
const { readFileSync } = require("fs")
const { Client } = require("ssh2")

const host = {
	host: config.ha.host,
	port: config.ha.port,
	username: config.ha.username,
	privateKey: readFileSync(config.ha.privateKey),
}

const options = {
	password: config.ha.password,
}

const renew = async () => {
	const conn = new Client()
	conn.connect(host)
	log.info("Connecting proxy to " + host.host + " as " + host.username)

	conn.on("ready", async () => {
		log.info("Connection ready")
		conn.exec("su - root", (err, stream) => {
			if (err) throw err
			stream
				.on("close", (code, signal) => {
					conn.end()
					log.info("Stream closed")
				})
				.on("data", async (data) => {
					if (data.toString().indexOf("Last login") != -1) {
						stream.write(`./autocert.sh\n`)
						stream.write(`exit\n`)
					} else {
						log.info("" + data.toString().replace(/\n/, ""))
					}
				})
				.stderr.on("data", (data) => {
					if (data.toString().indexOf("Password:") != -1) {
						//log.warn(`Password required`)
						stream.write(options.password + "\n")
					} else {
						log.info(`${data}`)
					}
				})
		})
	})
}
module.exports.renew = renew

const test = async () => {
	const conn = new Client()
	conn.connect(host)
	//log.info("Connecting proxy to " + host.host + " as " + host.username)

	conn.on("ready", async () => {
		//log.info("Connection ready")
		conn.exec("su - root", (err, stream) => {
			if (err) throw err
			stream
				.on("close", (code, signal) => {
					conn.end()
				})
				.on("data", async (data) => {
					if (data.toString().indexOf("Last login") != -1) {
						//stream.write(`./autocert.sh\n`)
						//stream.write("echo logged in\n")
						stream.write(`exit\n`)
					} else {
						log.info("" + data.toString().replace(/\n/, ""))
					}
				})
				.stderr.on("data", (data) => {
					if (data.toString().indexOf("Password:") != -1) {
						//log.warn(`Password required`)
						stream.write(options.password + "\n")
					} else {
						log.info(`${data}`)
					}
				})
		})
	})
}

module.exports.test = test
