const log = require("../../util/log")(__filename)
const { options } = require("./config")
const fs = require("fs")
const axios = require("axios")

const runJobs = async () => {
	getAuditRecords()
}

// https://id.atlassian.com/manage-profile/security/api-tokens
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-audit-records/#api-rest-api-3-auditing-record-get
const getAuditRecords = async () => {
	const url = "https://grupposcai.atlassian.net/rest/api/3/auditing/record"
	const options = {
		headers: {
			"Authorization": `Basic ${Buffer.from("admin.jira@grupposcai.it:ATATT3xFfGF04o0eBwO5eXinTpQWaN_fhBS6L0msyFQ7TqUn0cQwkYX1PcxLKqNKhG6mMZW6SKKPtgV5RyipYl0wNBkX-p2hemtR_txL22yIgtQnduaS3S4tAUTqISErSF9wf1ASFvhnR76J9i46SBfC_SSerx8C6x_jJRSw0MT_OETkhl916Rg=8CCD6488").toString("base64")}`,
			"Accept": "application/json",
		},
	}

	const result = await axios
		.get(url, options)
		.then((response) => {
			console.log(`Response: ${response.status} ${response.statusText}`)
			return response.data
		})
		//.then((text) => console.log(text))
		.catch((err) => console.error(err))

	console.dir(result.records)
}

module.exports = { runJobs }
