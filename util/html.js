const log = require("./log")(__filename)
const fs = require("fs")

const getHTML = async (file) => {
	let readFileSync = fs.readFileSync(file)
	try {
		let data, buff
		data = readFileSync
		buff = new Buffer.from(data, "base64")
		return buff.toString()
	} catch (error) {
		throw new Error(error)
	}
}

module.exports.getHTML = getHTML
