const log = require("./log")(__filename)
const config = require("../config/environment.js")()
const puppeteer = require("puppeteer")
const path = require("path")
const fs = require("fs")

const html2pdf = async (html) => {
	const filepath = path.resolve(config.filePath, "email.pdf")

	//log.info("Rendering html to pdf...")
	const browser = await puppeteer.launch({
		headless: "new",
	})

	const page = await browser.newPage()
	await page.setContent(html, { waitUntil: "domcontentloaded" })
	await page.emulateMediaType("screen")

	// Downlaod the PDF
	const pdf = await page.pdf({
		path: filepath,
		margin: { top: "10px", right: "20px", bottom: "20px", left: "20px" },
		printBackground: true,
		pageRanges: "1",
		format: "A4",
	})

	// Close the browser instance
	await browser.close()

	try {
		const data = fs.readFileSync(filepath)
		const buff = new Buffer.from(data, "base64")
		const content = buff.toString("base64url")

		//return content
		return filepath
	} catch (error) {
		throw new Error(error)
	} finally {
		fs.unlink(filepath, function (err) {
			if (err) {
				log.error(err.toString())
			}
		})
	}
}

module.exports.html2pdf = html2pdf
