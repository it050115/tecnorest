//https://rubular.com/r/Hguo19BE7X
const patterns = [/([a-zA-Z]{3})\s+([a-zA-Z]{3})\s+(\d+)\s+(\d+:\d+:\d+)\s+([a-zA-Z]+)\s+(\d{4})/i, /(\d+)[-|\/](\d+)[-|\/](\d+)\s+(\d+[:|.]\d+[:|.]\d+)/i]

const parseDate = (str) => {
	for (let i = 0; i < patterns.length; i++)
		if (patterns[i].test(str)) {
			const result = str.split(patterns[i])
			for (let j = 0; j < result.length; j++) {
				if (result[j]) {
					result[j] = result[j].trim()
				}
			}
			switch (i) {
				case 0:
					return f0(str, i, result)
				case 1:
					return f1(str, i, result)

				default:
					throw new Error("Date Regex function not available for match:" + i)
			}
		}
	throw new Error("Date Regex pattern not found for: " + str)
}

const f0 = (str, match, result) => {
	let mm
	switch (result[2]) {
		case "Jan":
			mm = "01"
			break
		case "Feb":
			mm = "02"
			break
		case "Mar":
			mm = "03"
			break
		case "Apr":
			mm = "04"
			break
		case "May":
			mm = "05"
			break
		case "Jun":
			mm = "06"
			break
		case "Jul":
			mm = "07"
			break
		case "Aug":
			mm = "08"
			break
		case "Sep":
			mm = "09"
			break
		case "Oct":
			mm = "10"
			break
		case "Nov":
			mm = "11"
			break
		case "Dec":
			mm = "12"
			break
	}

	const date = new Date(`${result[6]}-${mm}-${result[3]}T${result[4]}`)
	const dt = date.toISOString().substring(0, 16) + ":00Z"

	return { status: "ok", str, pattern: patterns[match], match, result: dt }
}

const f1 = (str, match, result) => {
	const yyyy = result[3].length == 2 ? "20" + result[3] : result[3]

	const date = new Date(`${yyyy}-${result[2]}-${result[1]}T${result[4]}`)
	const dt = date.toISOString().substring(0, 16) + ":00Z"

	return { status: "ok", str, pattern: patterns[match], match, result: dt }
}

//deleteme
const toISODateTime = (timeStamp) => {
	console.log(timeStamp)
	const patterns = [
		/^(\d{1,2})[-|\/](\d{1,2})[-|\/](\d{2,4})\s+(\d{2})[.|:](\d{2})[.|:](\d{2})$/i, // 19/04/23 18:33:00
		/^(\d{1,2})[-|\/](\d{1,2})[-|\/](\d{2,4})\s+(\d{2})[.|:](\d{2})$/i, //19/04/23 18:33
		/^(\d{1,2})[-|\/](\d{1,2})[-|\/](\d{2,4})$/i, //19/04/23
	]

	if (!timeStamp) {
		timeStamp = new Date()
	} else {
		timeStamp = new Date(timeStamp)
	}
	console.log(timeStamp)

	const dd = ("0" + timeStamp.getDate()).slice(-2)
	const MM = ("0" + (timeStamp.getMonth() + 1)).slice(-2)
	const yyyy = timeStamp.getFullYear()
	const hh = ("0" + timeStamp.getHours()).slice(-2)
	const mm = ("0" + timeStamp.getMinutes()).slice(-2)
	const ss = ("0" + timeStamp.getSeconds()).slice(-2)

	console.log(yyyy + "-" + MM + "-" + dd + "T" + hh + ":" + mm + ":" + ss + ".000Z")
	return yyyy + "-" + MM + "-" + dd + "T" + hh + ":" + mm + ":" + ss + ".000Z"
}

const dateTimeFormat = {
	undefined: 0,
	dateOnly: 1,
	timeOnly: 2,
}
/**
 *
 * @param {*} input
 * @param {*} fmt optional ['dateOnly' || 'timeOnly']
 * @returns
 */
const toSqlDatetime = (input) => {
	input = input.trim()
	const patterns = [
		/^(\d{1,2})[-|\/](\d{1,2})[-|\/](\d{2,4})\s+(\d{2})[.|:](\d{2})[.|:](\d{2})$/i, // 19/(0)4/(20)23 18:33:00
		/^(\d{1,2})[-|\/](\d{1,2})[-|\/](\d{2,4})\s+(\d{2})[.|:](\d{2})$/i, //19/(0)4/(20)23 18:33
		/^(\d{1,2})[-|\/](\d{1,2})[-|\/](\d{2,4})$/i, //19/(0)4/(20)23
	]

	for (let i = 0; i < patterns.length; i++)
		if (patterns[i].test(input)) {
			const result = input.split(patterns[i])
			for (let j = 0; j < result.length; j++) {
				if (result[j]) result[j] = result[j].trim()
			}
			//console.log(result)
			let output, dd, MM, yyyy, hh, mm, ss
			switch (i) {
				case 0:
					dd = ("0" + result[1]).slice(-2)
					MM = ("0" + result[2]).slice(-2)
					yyyy = ("20" + result[3]).slice(-4)
					hh = ("0" + result[4]).slice(-2)
					mm = ("0" + result[5]).slice(-2)
					ss = ("0" + result[6]).slice(-2)
					output = `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.000Z`
					return { input, match: i, pattern: patterns[i], output }

				case 1:
					dd = ("0" + result[1]).slice(-2)
					MM = ("0" + result[2]).slice(-2)
					yyyy = ("20" + result[3]).slice(-4)
					hh = ("0" + result[4]).slice(-2)
					mm = ("0" + result[5]).slice(-2)
					ss = "00"
					output = `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.000Z`
					return { input, match: i, pattern: patterns[i], output }

				case 2:
					dd = ("0" + result[1]).slice(-2)
					MM = ("0" + result[2]).slice(-2)
					yyyy = ("20" + result[3]).slice(-4)
					hh = "00"
					mm = "00"
					ss = "00"
					output = `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.000Z`
					return { input, match: i, pattern: patterns[i], output }

				default:
					return { error: "Datetime regex case not declared for: " + input }
			}
		}
	return { error: "Datetime regex pattern not found for: " + input }
}

module.exports = { parseDate, toSqlDatetime }
