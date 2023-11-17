const log = require("../../util/log")(__filename)
const { options } = require("./config")
const fs = require("fs")
const axios = require("axios")

const runJobs = async () => {
	getAuditRecords()
}

const getAuditRecords = async () => {
	const url = "https://grupposcai.atlassian.net/rest/api/3/auditing/record"
	const options = {
		headers: {
			"Authorization": `Basic ${Buffer.from("admin.jira@grupposcai.it:ATATT3xFfGF0zZWcFIlUIz8GrHT-GBaAcGh0dCgBD9SciNGXi8c-1hQnlRHoADP8TBhh0VWSKVDNhFPlHxB__UWUW-qbkRfelBtVCiCrfmMdH5kxZaEM3Vxu4LgIt1kRvphllvhIaoh9bP3mJi00pHV270W87hzWBmVq323aZxlXUVNtgsWw5t0=6CBD4F94").toString("base64")}`,
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
