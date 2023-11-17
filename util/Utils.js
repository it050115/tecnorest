const uuid = require("uuid")
const log = require("../util/log")(__filename)

class Utils {
	static generateGUID() {
		function S4() {
			//console.log(`Here is a test v1 uuid: ${uuid.v1()}`)
			//console.log(`Here is a test v4 uuid: ${uuid.v4()}`)

			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1)
		}

		return S4() + S4()
	}
}

module.exports = Utils
