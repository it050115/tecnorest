const log = require("../util/log")(__filename)
const oracle = require("../services/oracle.js")
const { ticket, account, asset, address } = require("./templates/schema")

class TicketManager {
	#template
	#data

	constructor(template, data) {
		this.#template = template
		this.#data = data

		this.ticketConditions
		this.accountConditions
		this.assetConditions
		this.idaccount
		this.idcomune
		this.idchiamata
		this.idasset
		this.idassettipologia
		this.idassetbrand
		this.idstato
		this.stato
	}

	setTicketCondition = (ticketConditions) => {
		this.ticketConditions = ticketConditions
	}

	setAccountCondition = (accountConditions) => {
		this.accountConditions = accountConditions
	}

	setAssetCondition = (assetConditions) => {
		this.assetConditions = assetConditions
	}

	getTicket = async (createOnFail) => {
		const sql = oracle.getSqlBuilder()
		let query = sql.$select({
			idchiamata: "IDCHIAMATA",
			idaccount: "IDACCOUNT",
			idasset: "IDASSET",
			idstato: "IDSTATO",
			$from: "OC.CHIAMATE",
			$where: this.ticketConditions,
		})
		const result = await oracle.execute(query.sql, query.values)

		if (result.rows && result.rows.length == 1) {
			const ticket = result.rows[0]
			this.idchiamata = ticket.IDCHIAMATA
			this.idaccount = ticket.IDACCOUNT
			this.idasset = ticket.IDASSET
			this.idstato = ticket.IDSTATO
			log.info(`- Ticket found [${this.idchiamata}]. End`)
		} else {
			if (createOnFail) {
				await this.#getAccount(true)
				await this.#getAsset(true)
				await this.#createTicket()
			} else {
				log.info(`- Ticket won't be created. End`)
			}
		}
		return this.idchiamata
	}

	#createTicket = async () => {
		const insert = this.#template.ticket
		insert.IDACCOUNT = this.idaccount
		insert.IDASSET = this.idasset
		insert.DESCRIZIONEPROBLEMA = this.#data.descrizioneproblema
		insert.IDSTATO = await this.#getStatus()
		insert.EMAIL = this.#data.email
		insert.PHONE = this.#data.phone
		insert.CONTACT = this.#data.contact
		insert.ADDINFO = this.#data.addinfo
		insert.RIFCHIAMATA = this.#data.rifchiamata
		insert.USERDATE = this.#data.userdate

		if (!this.#isValid(insert, ticket)) {
			log.warn("CreateTicket: Statement not valid")
		} else {
			const sql = oracle.getSqlBuilder()
			const query = sql.$insert({
				$table: "OC.CHIAMATE",
				$documents: insert,
			})
			oracle.getSqlPlaceholders(query)
			query.sql = query.sql.replace(":userdate", "TO_DATE(:userdate,'YYYY-MM-DD HH24:MI:SS')")

			const result = await oracle.execute(query.sql, query.values, {}, ["idchiamata", "chiamata"])

			if (result.rowsAffected != 1 || result.outBinds.idchiamata.length != 1) {
				throw new Error("Error getting newly created ticketid")
			}
			const idchiamata = result.outBinds.idchiamata[0]
			if (idchiamata === null) {
				throw new Error("Ticketid is null")
			}

			log.info(`- Ticket created [${idchiamata}]`)
			this.idchiamata = idchiamata

			//await oracle.commit()
		}
	}

	#getAccount = async (createOnFail) => {
		const sql = oracle.getSqlBuilder()
		let query = sql.$select({
			idaccount: "IDACCOUNT",
			$from: "OC.ACCOUNTS",
			$where: this.accountConditions,
		})

		query.sql = query.sql.replace("contatto1", "UPPER(contatto1)")
		const result = await oracle.execute(query.sql, query.values)

		if (result.rows && result.rows.length == 1) {
			this.idaccount = result.rows[0].IDACCOUNT
			log.info(`- Account found [${this.idaccount}]`)
		} else {
			if (createOnFail) {
				await this.#createAccount()
			}
		}
		return this.idaccount
	}

	#createAccount = async () => {
		const insert = this.#template.account
		insert.ACCOUNT = this.#data.referente
		insert.INDIRIZZO1 = this.#data.indirizzo1
		insert.PLACEID = await this.#getPlaceId()
		insert.TEL1 = this.#data.phone
		insert.EMAIL1 = this.#data.email
		insert.CONTATTO1 = this.#data.contatto1
		insert.IDCOMUNE1 = await this.#getAddress()

		if (!this.#isValid(insert, account)) {
			throw new Error("Create Account: Statement not valid")
		} else {
			const sql = oracle.getSqlBuilder()
			const query = sql.$insert({
				$table: "OC.ACCOUNTS",
				$documents: insert,
			})

			const result = await oracle.execute(query.sql, query.values, {}, ["idaccount"])

			if (result.rowsAffected != 1 || result.outBinds.idaccount.length != 1) {
				throw new Error("Error getting newly created accountid")
			}
			const idaccount = result.outBinds.idaccount[0]
			if (idaccount === null) {
				throw new Error("Accountid is null")
			}

			log.info(`- Account created [${idaccount}]`)
			this.idaccount = idaccount
		}
	}

	#getAddress = async () => {
		const sql = oracle.getSqlBuilder()
		let query = sql.$select({
			idcomune: "IDCOMUNE",
			comune: "COUMUNE",
			$from: "OC.COMUNI",
			$where: {
				cap: this.#data.cap,
				comune: this.#data.comune.toUpperCase(),
			},
		})
		const where = query.sql.split(/where/i)
		query.sql = where[0] + "WHERE" + where[1].replace("comune", "UPPER(comune)")

		const result = await oracle.execute(query.sql, query.values)

		if (result.rows && result.rows.length == 1) {
			this.idcomune = result.rows[0].IDCOMUNE
			//log.info(`- Address found [${this.idcomune}]`)
		} else {
			console.error("Address does not exist. Abort")
		}

		return this.idcomune
	}

	#getAsset = async (createOnFail) => {
		const sql = oracle.getSqlBuilder()
		let query = sql.$select({
			idasset: "IDASSET",
			$from: "OC.ASSET",
			$where: this.assetConditions,
		})

		query.sql = query.sql.replace("seriale", "UPPER(seriale)")
		const result = await oracle.execute(query.sql, query.values)

		if (result.rows && result.rows.length == 1) {
			this.idasset = result.rows[0].IDASSET
			log.info(`- Asset found [${this.idasset}]`)
		} else {
			if (createOnFail) {
				await this.#createAsset()
			}
		}
		return this.idasset
	}

	#createAsset = async () => {
		const insert = this.#template.asset
		insert.IDACCOUNT = this.idaccount
		insert.MODELLO = this.#data.modello
		insert.SERIALE = this.#data.seriale
		insert.IDASSETTIPOLOGIA = await this.#getAssetType()
		insert.IDASSETBRAND = await this.#getAssetBrand()

		if (!this.#isValid(insert, asset)) {
			throw new Error("Create Asset: Statement not valid")
		} else {
			const sql = oracle.getSqlBuilder()
			const query = sql.$insert({
				$table: "OC.ASSET",
				$documents: insert,
			})

			const result = await oracle.execute(query.sql, query.values, {}, ["idasset"])

			if (result.rowsAffected != 1 || result.outBinds.idasset.length != 1) {
				throw new Error("Error getting newly created assetid")
			}
			const idasset = result.outBinds.idasset[0]
			if (idasset === null) {
				throw new Error("Assetid is null")
			}

			log.info(`- Asset created [${idasset}]`)
			this.idasset = idasset
		}
	}

	#getStatus = async () => {
		const sql = oracle.getSqlBuilder()
		let query = sql.$select({
			idstato: "IDSTATO",
			stato: "STATO",
			$from: "OC.STATI",
			$where: {
				deleted: 0,
				idclienteprofilo: this.#data.idclienteprofilo,
				startpoint: 1,
			},
		})

		const result = await oracle.execute(query.sql, query.values)

		if (result.rows && result.rows.length == 1) {
			this.idstato = result.rows[0].IDSTATO
			this.stato = result.rows[0].STATO
		} else {
			console.error("Status not found. Abort")
		}
		return this.idstato
	}

	#getPlaceId = async () => {
		/*	const condition = "ADDINFO='9999' AND IDCLIENTEPROFILO=2"
		let p = 0
		const sql = `SELECT (NVL(MAX(TO_NUMBER(PLACEID)),0)+1) PLACEID FROM OC.ACCOUNTS`
		p = 0
		const json = `{ "p${p++}": "99999", "p${p++}": 2 }`
		//const values = { p0: "99999", p1: 2 }
		const values = JSON.parse(json)
		const result = await oracle.execute(sql, values) */
		const sql = `SELECT (NVL(MAX(TO_NUMBER(PLACEID)),0)+1) PLACEID FROM OC.ACCOUNTS`
		const values = []
		const result = await oracle.execute(sql, values)

		if (result.rows && result.rows.length == 1) {
			return result.rows[0].PLACEID
		} else {
			console.error("Placeid not available")
		}
		return null
	}

	#getAssetType = async () => {
		const sql = oracle.getSqlBuilder()
		let query = sql.$select({
			idassettipologia: "IDASSETTIPOLOGIA",
			$from: "OC.ASSETTIPOLOGIE",
			$where: {
				idclienteprofilo: this.#data.idclienteprofilo,
				tipologia: this.#data.tipologia.toUpperCase().trim(),
			},
		})

		const result = await oracle.execute(query.sql, query.values)

		if (result.rows && result.rows.length == 1) {
			this.idassettipologia = result.rows[0].IDASSETTIPOLOGIA
		} else {
			console.error("AssetType does not exist")
		}

		return this.idassettipologia
	}

	#getAssetBrand = async () => {
		const sql = oracle.getSqlBuilder()
		let query = sql.$select({
			idassetbrand: "IDASSETBRAND",
			$from: "OC.ASSETBRANDS",
			$where: {
				brand: this.#data.brand.toUpperCase().trim(),
			},
		})

		const result = await oracle.execute(query.sql, query.values)

		if (result.rows && result.rows.length == 1) {
			this.idassetbrand = result.rows[0].IDASSETBRAND
		} else {
			console.error("AssetBrand does not exist")
		}

		return this.idassetbrand
	}

	#isValid = (template, schema) => {
		let result = true
		for (var key in template) {
			if ((template[key] == null || template[key] == undefined) && schema.mandatory.find((x) => x.name === key)) {
				result = false
				log.warn(key + " is mandatory!")
			}
		}
		return result
	}
}

module.exports = TicketManager
