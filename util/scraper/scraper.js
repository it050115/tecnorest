const puppeteer = require("puppeteer")
//https://pptr.dev/

;(async () => {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	await page.goto("https://example.com")
	await page.screenshot({ path: "../files/example.png" })

	await browser.close()
})()
