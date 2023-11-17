const log = require("../util/log")(__filename)
const fs = require("fs")
const pdfParse = require("pdf-parse")
//const { PDFDocument } = require("pdf-lib")

//https://www.npmjs.com/package/pdf-parse
//https://www.npmjs.com/package/pdf-lib?activeTab=readme (create pdf)
//https://blog.logrocket.com/managing-pdfs-node-pdf-lib/
//https://github.com/mozilla/pdf.js

const getPDF = async (file) => {
	let readFileSync = fs.readFileSync(file)
	try {
		let pdfExtract = await pdfParse(readFileSync)
		//console.log("File content: ", pdfExtract.text)
		//console.log("Total pages: ", pdfExtract.numpages)
		//console.log("All content: ", pdfExtract.info)
		//return ({ info, numpages, text } = pdfExtract)
		//log.debug("- pdf parsed successfully"
		return pdfExtract.text
	} catch (error) {
		throw new Error(error)
	}
}

module.exports.getPDF = getPDF
