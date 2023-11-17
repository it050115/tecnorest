const log = require("../util/log")(__filename)
const config = require("../config/environment.js")()
const oracledb = require("oracledb")
const SQLBuilder = require("json-sql-builder2")

let count = 0,
	maxretry = 3
let connection = null,
	connectionPool = null,
	sqlBuilder = null

/**
 * https://www.npmjs.com/package/json-sql-builder2#more-examples
 * https://node-oracledb.readthedocs.io/en/latest/index.html
 * https://blogs.oracle.com/opal/post/node-oracledb-v2-query-methods-and-fetch-tuning
 */
const defaultThreadPoolSize = 4

// Increase thread pool size by poolMax
process.env.UV_THREADPOOL_SIZE = config.oraclePool.poolMax + defaultThreadPoolSize

/**
 * initialize Oracle Universal Connection pool
 */
const initialize = async () => {
	if (count < maxretry) {
		log.info("Connecting to " + config.oraclePool.user + ":" + config.oraclePool.connectString + " with retry")
		await oracledb
			.createPool(config.oraclePool)
			.then((pool) => {
				log.info("OracleDB is connected. [Pool min:" + pool.poolMin + " max:" + pool.poolMax + " open:" + pool.connectionsOpen + "]")
				connectionPool = pool
			})
			.catch((err) => {
				log.error(err)
				log.warn("OracleDB connection unsuccessful, retry after 3 seconds. ", ++count)
				setTimeout(initialize, 5000)
			})
	} else {
		log.warn("OracleDB connection unsuccessful after 3 try.")
	}
}

/**
 * get Connection Pool
 * @returns connection
 */
const getConnection = async () => {
	if (!connection) {
		connection = await oracledb.getConnection()
	}
	return connection
}

/**
 * Close Oracle Universal Connection pool
 */
const close = async () => {
	await oracledb.getPool().close()
	log.info("Oracle Pool closed")
}

/**
 *
 * @param {*} statement query statement
 * @param {*} binds	column values
 * @param {*} options es.: { autoCommit: true } default: false
 * @param {*} bindout column name to be returned in case of insert
 * @returns	result object
 */
const execute = async (statement, binds = [], options = {}, bindouts = []) => {
	//RETURNING IDCHIAMATA, CHIAMATA INTO :idchiamata, :chiamata`
	let returning = "",
		into = ""
	let addbinds = {}

	if (bindouts && bindouts.length > 0) {
		returning = returning.concat(` RETURNING `)
		into = ` INTO `

		let i = 0
		for (let bindout in bindouts) {
			console.log(bindout)
			returning = returning.concat(`${bindout} `) //${bindout} INTO :${bindout}
			into = into.concat(`:${bindout}`)
			addbinds[bindout] = { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }

			if (i <= bindouts.length) {
				returning = returning.concat(`, `)
				into = into.concat(`, `)
			}
			i++
		}
	}
	//console.log("->" + returning.concat(into))

	return new Promise(async (resolve, reject) => {
		//const sql = bindout ? statement.concat(" ").concat(`RETURNING ${bindout} INTO :${bindout}`) : statement
		const sql = statement.concat(returning)
		//const values = bindout ? { ...binds, ...{ [bindout]: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } } } : binds
		const values = { ...binds, ...addbinds }

		const opts = { ...{ outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: false }, ...options }

		//console.log(sql)
		//console.log(values)
		//console.log(opts)

		try {
			connection = await getConnection()
			const result = await connection.execute(sql, values, opts)
			result.autoCommit = opts.autoCommit
			resolve(result)
		} catch (err) {
			if (connection) {
				try {
					await connection.close()
				} catch (err) {
					log.error(err)
				}
			}
			reject(err)
		} finally {
			//const poolstatistics = connectionPool.getStatistics()
			//log.debug("Oracle [Pool min:" + poolstatistics.poolMin + " max:" + poolstatistics.poolMax + " open:" + poolstatistics.connectionsOpen + "]")
		}
	})
}

/**
 * Commt transaction pool
 */
const commit = async () => {
	try {
		await connection.commit()
		log.info("Transaction committed")
	} catch (err) {
		log.error(err)
	} finally {
		if (connection) {
			try {
				await connection.close()
			} catch (err) {
				log.error(err)
			}
		}
	}
}

/**
 * Get or create sqlBuilder to normalize query
 * @returns sqlBuilder
 */
const getSqlBuilder = () => {
	if (!sqlBuilder) {
		//console.log("first sqlBuilder created")
		sqlBuilder = new SQLBuilder(function (sql) {
			sql.setLanguage("Oracle")
			sql.setQuoteChar('"', '"')
			sql.placeholder = function () {
				return ":p" + (sql._values.length - 1)
			}
			sql.transformValueResult = function (valuesAsArray) {
				let resultAsObj = {}
				sql.forEach(valuesAsArray, (value, index) => {
					resultAsObj["p" + index] = value
				})
				return resultAsObj
			}
		})
	}
	return sqlBuilder
}

/**
 * Transform sqlBuider placeholders in named placeholders
 * @param {*} query The sqlBuilder result query
 */
const getSqlPlaceholders = (query) => {
	const sqlSplit = query.sql.split(" VALUES ")
	const cols = sqlSplit[0]
	let vals = sqlSplit[1]

	// get query named columns
	const colsLeft = cols.split("(")
	const colsRight = colsLeft[1].split(")")
	const colList = colsRight[0].split(",")
	const colArray = []
	colList.map((index) => {
		colArray.push(index.trim().replaceAll(/"/g, "").toLowerCase())
	})

	// get values placeholders as array
	vals = vals.replace("(", "")
	vals = vals.replace(")", "")
	const valList = vals.split(",")
	const valArray = []
	valList.map((index) => {
		valArray.push(index.trim().replaceAll(/"/g, ""))
	})

	// create a new statement with named placeholders
	let namedSql = query.sql
	for (let i = 0; i < valArray.length; i++) {
		namedSql = namedSql.replace(valArray[i], `:${colArray[i]}`)
	}
	query.sql = namedSql

	// create a new values object with named placeholders
	let namedValues = {}
	for (let i = 0; i < valArray.length; i++) {
		namedValues[colArray[i]] = query.values[`p${i}`]
	}
	query.values = namedValues
}

const executeStatement = async (opts = {}) => {
	return new Promise(async (resolve, reject) => {
		opts.outFormat = oracledb.OUT_FORMAT_OBJECT
		opts.autoCommit = false

		try {
			connection = await oracledb.getConnection()

			const old = `INSERT INTO "OC"."CHIAMATE" (
					"IDCLIENTE", "IDACCOUNT", "IDASSET", "IDCLIENTEPROFILO", "IDOPERATORE", "IDSEVERITA", 
					"IDCODA", "IDSTATO", "IDCATEGORIAPROBLEMA", "IDCATEGORIARICHIESTA", "RIFCHIAMATA", 
					"ASSEGNAZIONE", "NOLOG", "IO", "UI", "ADDINFO", "REMOTEUSER", "ORIGINE", "DESCRIZIONEPROBLEMA", 
					"USERDATE",
					"PHONE", "CONTACT", "EMAIL", "NOTAINTERNA"
				) VALUES (
					:idcliente, :idaccount, :idasset, :idclienteprofilo, :idoperatore, :idseverita, 
					:idcoda, :idstato, :idcategoriaproblema, :idcategoriarichiesta, :rifchiamata, 
					:assegnazione, :nolog, :io, :ui, :addinfo, :remoteuser, :origine, :descrizioneproblema, 
					TO_DATE(:userdate,'DD/MM/YYYY HH24:MI:SS'),
					:phone, :contact, :email, :notainterna
				) RETURNING IDCHIAMATA INTO :idchiamata`

			const test = `INSERT INTO OC.CHIAMATE (
					IDCLIENTE, IDACCOUNT, IDASSET, IDCLIENTEPROFILO, IDOPERATORE, IDSEVERITA, IDCODA, IDSTATO, 
					NOLOG, IO, UI, 
					ORIGINE, DESCRIZIONEPROBLEMA
				) VALUES (
					:idcliente, :idaccount, :idasset, :idclienteprofilo, :idoperatore, :idseverita, :idcoda, :idstato, 
					:nolog, :io, :ui, 
					:origine, :descrizioneproblema
				) RETURNING IDCHIAMATA, CHIAMATA INTO :idchiamata, :chiamata`

			const result = await connection.execute(
				test,
				{
					idcliente: 2,
					idaccount: 31856,
					idasset: 20765,
					idclienteprofilo: 2,
					idoperatore: 2,
					idseverita: 4,
					idcoda: 4,
					idstato: 45,
					nolog: 0,
					io: 1,
					ui: 0,
					origine: "DEMO",
					descrizioneproblema: "TESTING",
					idchiamata: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
					chiamata: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
				},
				opts
			)
			resolve(result)
		} catch (err) {
			reject(err)
		}
	})
}

module.exports = { initialize, execute, commit, close, getSqlBuilder, getSqlPlaceholders, executeStatement }
