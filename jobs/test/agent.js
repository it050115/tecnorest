const log = require("../../util/log")(__filename)
const { options, model } = require("./config")
const { getCurrentDate } = require("../../util/util")
const fs = require("fs")
const Mssql = require("../../services/mssql")
const { NVarChar, Numeric, DateTime, Date, Int } = require("mssql")
const xls = require("convert-excel-to-json")
const Google = require("../../services/google")
const xl = require("excel4node")
const { parseDate, parseDateTime, toSqlDatetime } = require("../../util/dateParser")
//const { NVarChar, Numeric, DateTime, Date, Int } = require("mssql")
//https://www.npmjs.com/package/excel4node

const runJobs = async () => {
	//const data = await testSelect()
	//testXls(data)
	//testXls(data.recordset)
	//uploadFile("files/SHPMNTSIT-2.XLS")
}

/*
const testXls = (data) => {
	//console.log(data)
	const options = {
		jszip: {
			compression: "DEFLATE",
		},
		defaultFont: {
			size: 12,
			name: "Calibri",
		},
		dateFormat: "dd/mm/yyyy HH:mm:ss",
		numberFormat: "$#,##0.00; ($#,##0.00); -",
		author: "Crowd Services Admin",
	}

	const wb = new xl.Workbook(options)
	const ws = wb.addWorksheet("Backlog")

	// Create header style
	const headerStyle = wb.createStyle({
		font: {
			bold: true,
		},
		alignment: {
			horizontal: "left",
		},
		fillColor: "#ABABAB",
	})

	//Write Column Title in Excel file
	const headingColumnNames = Object.keys(data[0])
	const headingColumnCount = headingColumnNames.length
	let headingColumnIndex = 1
	headingColumnNames.forEach((heading) => {
		ws.cell(1, headingColumnIndex++).string(heading).style(headerStyle)
	})

	//Write Data in Excel file
	let rowIndex = 2
	data.forEach((record) => {
		let columnIndex = 1
		Object.keys(record).forEach((columnName) => {
			if (record[columnName]) {
				if (record[columnName] instanceof Date) {
					ws.cell(rowIndex, columnIndex++).date(record[columnName])
				} else if (record[columnName] instanceof Number) {
					ws.cell(rowIndex, columnIndex++).number(record[columnName])
				} else {
					ws.cell(rowIndex, columnIndex++).string(record[columnName])
				}
			} else {
				columnIndex++
			}
		})
		rowIndex++
	})

	wb.write("files/ExcelFile.xlsx", function (err, stats) {
		if (err) {
			console.error(err)
		} else {
			console.log("ExcelFile.xlsx")
			//console.log(stats) // Prints out an instance of a node.js fs.Stats object
		}
	})
}

*/

/*
async function uploadFile(sourceFileName) {
	log.debug(`uploadFile(${sourceFileName})`)

	const google = new Google(options.account)

	const teamDriveID = await google.getTeamDrives("Report")
	//console.log({ teamDriveID })

	//const list = await google.getFiles(teamDriveID.id)
	//console.log(list)

	const res = await google.uploadFileInTeamDrive(sourceFileName, `backlog-${getCurrentDate()}`, "xlsx", teamDriveID.id)
	console.log(res)
}

*/

async function uploadFile(sourceFileName) {
	log.debug(`uploadFile(${sourceFileName})`)

	const google = new Google(options.account)

	const teamDriveID = await google.getTeamDrives("Report")
	//console.log({ teamDriveID })

	//const list = await google.getFiles(teamDriveID.id)
	//console.log(list)

	const res = await google.uploadFileInTeamDrive(sourceFileName, `backlog-${getCurrentDate()}`, "xlsx", teamDriveID.id)
	console.log(res)
}

async function testMime() {
	//console.log(getMimeType("mp3"))
	//console.log(getGoogleMimeType("xlsx"))
	//console.log("return: " + getGoogleMimeType("mp3"))
	//console.log(getExtension("application/vnd.google-apps.spreadsheet"))
}

async function testInsert() {
	try {
		const filepath = "/Users/it050382/Node/tecnorest/files/SHPMNTSIT-2.XLS"

		const result = xls({
			sourceFile: filepath,
			header: {
				rows: 1,
			},
			sheets: ["Sheet1"],
			columnToKey: {
				A: "shipto",
				B: "partnumber",
				C: "description",
				D: "qta",
				E: "waybill",
				G: "ordernumber",
				O: "shipdate",
				R: "contact",
				S: "address1",
				T: "address2",
				//"*": "{{columnHeader}}",
			},
		})

		const spreadList = []
		if (result.Sheet1.length) {
			let def
			result.Sheet1.map((row) => {
				const dt = row.shipdate.toString()
				def = {
					date: dt.substr(0, 4) + "-" + dt.substr(4, 2) + "-" + dt.substr(6),
					address: row.address1,
					cap: row.address2.substr(0, 6).trim(),
					city: row.address2.substr(6).trim(),
					courier: "UPS",
				}
				delete row.address1
				delete row.address2
				delete row.shipdate
				spreadList.push({ ...model, ...row, ...def })
			})
			//console.dir(spreadList)
			log.info("- " + result.Sheet1.length + " record(s) found")

			const mssql = new Mssql()

			let query = `insert into Ticket_WS.dbo.PartShipping (
								courier,shipto,partnumber,description,qta,waybill,ordernumber,date,contact,address,cap,city
							) values (
								@courier,@shipto,@partnumber,@description,@qta,@waybill,@ordernumber,@date,@contact,@address,@cap,@city
							)`
			let bindin = [
				{ name: "courier", type: NVarChar },
				{ name: "shipto", type: NVarChar },
				{ name: "partnumber", type: NVarChar },
				{ name: "description", type: NVarChar },
				{ name: "qta", type: Numeric },
				{ name: "waybill", type: NVarChar },
				{ name: "ordernumber", type: NVarChar },
				{ name: "date", type: DateTime },
				{ name: "contact", type: NVarChar },
				{ name: "address", type: NVarChar },
				{ name: "cap", type: NVarChar },
				{ name: "city", type: NVarChar },
			]
			let bindout = [{ name: "id", type: Int }]
			let values = spreadList

			let output = await mssql.executeTransaction(query, values, bindin, bindout)
			console.dir(output.rowsAffected)

			output = await mssql.executeTransaction(query, values, bindin, [])
			console.dir(output.rowsAffected)

			await mssql.commitTransaction()
		} else {
			console.log("No record(s) found or invalid sheet")
		}
	} catch (error) {
		log.dump(error)
	}
}

async function testSelect() {
	let query = `SELECT * FROM HDA.dbo.WS_Canon_ActivityID WHERE IDIntervento LIKE @idintervento and IDFornCli=@IDFornCli`
	let values = [
		{
			idintervento: "I672%",
			IDFornCli: "C10C",
		},
		{
			idintervento: "I673%",
			IDFornCli: "C10C",
		},
	]
	let bindin = [
		{ name: "idintervento", type: NVarChar },
		{ name: "IDFornCli", type: NVarChar },
	]
	const mssql = new Mssql()

	let output = await mssql.executePreparedStatement(query, values, bindin, [])
	console.log("tot:" + output.rowsAffected)
	console.log(output.recordsets[0].rowsAffected)
	console.log(output.recordsets[0].recordset[0])

	console.log(output.recordsets[1].rowsAffected)
	console.log(output.recordsets[1].recordset[0])
}

async function testSelect2() {
	let query = `SELECT TOP 2 * FROM HDA.dbo.G_Ticket_Manut_backlog_RP`

	const output = await Mssql.execute(query)
	//console.log(output)
	console.log(output.rowsAffected)
	return output
}

const testSqlDateTime = () => {
	const sample = ["19/4/23 15:23"] //, "19/4/23", "19/04/23 18.34"]
	for (let i = 0; i < sample.length; i++) {
		console.log(toSqlDatetime(sample[i]))
	}
}

const testProjection = () => {
	const exclusions = {
		_id: 0,
		__v: 0,
	}
	const projection = { password: 1, token: 1, refresh: 0 }

	let result = {}
	const res = Object.keys(projection).filter((key) => projection[key] === 1)
	if (res.length) {
		Object.entries(res).forEach(([k, v]) => (result[v] = 1))
	} else {
		result = { ...exclusions, ...projection }
	}

	console.log(result)

	//return User.findOne(filter, { ...exclusions, ...projection }).lean(lean)
}

module.exports = { runJobs, testInsert, testSelect, uploadFile, testSqlDateTime, testProjection }
