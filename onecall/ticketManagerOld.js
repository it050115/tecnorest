const log = require("../util/log")(__filename)
const oracle = require("../services/oracle.js")
const { ticketSchema, accountSchema, assetSchema, addressSchema } = require("./templates/schema")

this.ticketConditions
this.accountConditions
this.assetConditions
this.data
this.idaccount
this.idchiamata
this.idasset
this.idstato

const setTicketCondition = (ticketConditions) => {
	this.ticketConditions = ticketConditions
}

const setAccountCondition = (accountConditions) => {
	this.accountConditions = accountConditions
}

const setAssetCondition = (assetConditions) => {
	this.assetConditions = assetConditions
}

const getTicket = async (createOnFail) => {
	const sql = "SELECT IDCHIAMATA FROM OC.CHIAMATE WHERE ADDINFO = :p0 AND idclienteprofilo = :p1"
	const values = { p0: "99999", p1: 2 }

	result = await oracle.execute(sql, values)

	if (result.rows && result.rows.length == 1) {
		this.idchiamata = result.rows[0].IDCHIAMATA
	} else {
		if (createOnFail) {
			console.log("Ticket should be created")
		}
	}
}

const getAccount = async (createOnFail) => {
	const sql = "SELECT IDACCOUNT FROM OC.ACCOUNTS WHERE UPPER(contatto1) = :p0 AND idclienteprofilo = :p1 AND deleted = :p2"
	//const values = { p0: "GUGLIELMO FARINA", p1: 2, p2: 0 }
	const values = { p0: "GUGLIELMO FARINA", p1: 2, p2: 0 }

	result = await oracle.execute(sql, values)

	if (result.rows && result.rows.length == 1) {
		this.idaccount = result.rows[0].IDACCOUNT
	} else {
		if (createOnFail) {
			console.log("Account should be created")
		}
	}
}

const getAsset = async (createOnFail) => {
	const sql = "SELECT IDASSET FROM OC.ASSET WHERE UPPER(seriale) = :p0 AND idclienteprofilo = :p1 AND deleted = :p2"
	const values = { p0: "werrewr323", p1: 2, p2: 0 }

	result = await oracle.execute(sql, values)

	if (result.rows && result.rows.length == 1) {
		this.idasset = result.rows[0].IDASSET
	} else {
		if (createOnFail) {
			console.log("Asset should be created")
		}
	}
}

const getStatus = async () => {
	const sql = "SELECT IDSTATO, STATO FROM OC.STATI WHERE DELETED = :p0 AND SYSTEM = :p1 AND IDCLIENTEPROFILO = :p2 AND STARTPOINT = :p3"
	const values = { p0: 0, p1: 0, p2: 1, p3: 1 }

	result = await oracle.execute(sql, values)

	if (result.rows && result.rows.length == 1) {
		this.idstato = result.rows[0].IDSTATO
	} else {
		console.error("Status not found")
	}
}

const run = async (defaultSchema, data) => {
	this.data = data
	console.dir(this.data)

	//await getTicket(true)
	await getAccount(true)
	await getAsset(true)
	await getStatus()

	console.log(this.idchiamata)
	console.log(this.idaccount)
	console.log(this.idasset)
	console.log(this.idstato)

	//console.log(ticketSchema.mandatory)
	if (!isValid(defaultSchema)) {
		console.warn("Statement not valid")
	}
}

isValid = (schema) => {
	let result = true
	for (var key in schema) {
		if ((schema[key] == null || schema[key] == undefined) && ticketSchema.mandatory.find((x) => x.name === key)) {
			result = false
			console.log(key + " is mandatory!")
		}
	}
	return result
}

module.exports = { setTicketCondition, setAccountCondition, setAssetCondition, run }
