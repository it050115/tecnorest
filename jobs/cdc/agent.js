const log = require("../../util/log")(__filename)
const path = require("path")
const config = require("../../config/environment.js")()
const { options } = require("./config")
const template = require("./templates/models")
const Google = require("../../services/google")
const fs = require("fs")
const convert = require("xml-js")
//const mssql = require("../../services/mssql")
const { sendMail } = require("../../util/sendMail")
//const cheerio = require("cheerio")
const { getAddress } = require("../../util/addressNormalizer")
//const oracle = require("../../services/oracle.js")
//const jsonSql = require("json-sql")()
const TicketManager = require("../../onecall/TicketManager")
const { setBean } = require("./bean")

const CUSTOMER = "CDC"
let google

async function importTicket() {
	try {
		google = new Google(options.account)

		const messages = await google.getMessages(options.query, options.queryLimit)
		if (messages) {
			log.info("Job: /" + CUSTOMER + "/ " + messages.length + " message(s) found.")
			for (let m = 0; m < messages.length; m++) {
				const message = messages[m]
				const json = await google.getMessage(message.id)
				const info = google.getMessageSummary(json)
				log.info(info.summary)

				let body
				if (json.payload.body.size === 0) {
					const parts = json.payload.parts
					for (let i = 0; i < parts.length; i++) {
						const part = parts[i]
						if (part.mimeType == "text/html") {
							body = JSON.stringify(part.body.data)
						}
					}
				} else {
					body = JSON.stringify(json.payload.body.data)
				}

				const buff = new Buffer.from(body, "base64").toString()
				if (buff != null && buff.length > 0 && buff.indexOf("-EXTERNAL MAIL-") != -1) {
					const data = buff.split("-EXTERNAL MAIL-")[1]

					const dataArray = data.split("@@")
					const items = dataArray.filter((item) => item != "\r\n" && item != "\r\n\r\n")

					const jsonData = {}
					items.forEach((line) => {
						const el = line.split(":")
						jsonData[el[0]] = el[1]
					})

					const bean = setBean(jsonData)
					bean.idclienteprofilo = 2
					bean.userdate = info.date

					const tm = new TicketManager(template, bean)
					tm.setTicketCondition({ rifchiamata: "REM0909111", idclienteprofilo: bean.idclienteprofilo })
					tm.setAccountCondition({ contatto1: "GUGLIELMO FARINA", idclienteprofilo: bean.idclienteprofilo, deleted: 0 })
					tm.setAssetCondition({ seriale: "45-23421", idclienteprofilo: bean.idclienteprofilo, deleted: 0 })

					const t = await tm.getTicket(true)
					console.log(t)
				} else {
					// error
				}

				/*
				//const ticket = { id: "XXXC" } //debug
				//log.info(`Job: /${CUSTOMER}/ ${ticket.id} Ticket created and email sent`)

				// mark message as read with label [ONECALL]
				let label = await google.getLabel(options.label.name)
				if (!label) label = await google.createLabel(options.label)
				await google.applyLabel(message.id, label.id)*/
			}
		} else {
			log.info("Job: /" + CUSTOMER + "/ No message(s) found")
		}
	} catch (error) {
		log.dump(error)
		//sendMail("guglielmo.farina@grupposcai.it", "Restbox", error)
		// insert a record in log table
		/*await mssql.execute(`insert into [HDA].[dbo].[Wsclog] 
			(Customer,Status,Error) 
			VALUES 
			('${CUSTOMER}','Error', '${error}')`)*/
	}
}

const deleteFile = async (file) => {
	fs.unlink(file, function (err) {
		if (err) {
			log.error(err.toString())
		} /*else {
			log.debug("- attachment deleted")
		}*/
	})
}

function testAddress() {
	const data = require("../../_deleteme/test/data")
	let records = [...new Set(data)]
	let n = 0
	for (let i = 0; i < records.length; i++) {
		const address = getAddress(records[i])

		if (address.match === 0) {
			console.log(address)
			return
		}
	}
}

const toISO = (timeStamp) => {
	if (!timeStamp) throw new Error("timestamp is empty or invalid")
	timeStamp = timeStamp.replace("Ora: ", "").trim()
	const timeStampArray = timeStamp.split(" ")
	const dateArray = timeStampArray[0].split("/")
	return (dt = dateArray[2] + "-" + dateArray[1] + "-" + dateArray[0] + "T" + timeStampArray[1]) + ":00Z"
}

/** Transcoding table for TicketTypeID
Tipo Chiamate cliente		TicketTypeID & ObjectTypeID	ServiceID	TicketPriorityID
AVARIA STAMPANTE				T18C									S8C			P6C
INSTALLAZIONE					T19C									S9C			P7C
RICHIESTA TONER				T18C									S8C			P6C
RITIRO							T22C									S12C			P16C
TRASPORTO ED INSTALLAZIONE	T21C									S11C			P16C
TRASPORTO						T20C									S10C			P16C
*/
const typeId = (type) => {
	if (!type) throw new Error("Type is empty")
	switch (type) {
		case "AVARIA STAMPANTE":
			return { TicketTypeID: "T18C", ObjectTypeID: "T18C", ServiceID: "S8C", TicketPriorityID: "P6C" }

		case "INSTALLAZIONE":
			return { TicketTypeID: "T19C", ObjectTypeID: "T19C", ServiceID: "S9C", TicketPriorityID: "P7C" }

		case "RICHIESTA TONER":
			return { TicketTypeID: "T18C", ObjectTypeID: "T18C", ServiceID: "S8C", TicketPriorityID: "P6C" }

		case "RITIRO":
			return { TicketTypeID: "T22C", ObjectTypeID: "T22C", ServiceID: "S12C", TicketPriorityID: "P16C" }

		case "TRASPORTO ED INSTALLAZIONE":
			return { TicketTypeID: "T21C", ObjectTypeID: "T21C", ServiceID: "S11C", TicketPriorityID: "P16C" }

		case "TRASPORTO":
			return { TicketTypeID: "T20C", ObjectTypeID: "T20C", ServiceID: "S10C", TicketPriorityID: "P16C" }

		default:
			log.warn("Transcoding TicketTypeID not found: " + type + ". Fallback to T19C")
			return { TicketTypeID: "T19C", ObjectTypeID: "T19C", ServiceID: "S9C", TicketPriorityID: "P7C" }
	}
}

module.exports.importTicket = importTicket
//module.exports.testAddress = testAddress
