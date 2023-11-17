const puppeteer = require("puppeteer")

const run = async () => {
	const browser = await puppeteer.launch({
		headless: "new",
		// `headless: true` (default) enables old Headless;
		// `headless: 'new'` enables new Headless;
		// `headless: false` enables “headful” mode.
	})
	const page = await browser.newPage()
	await page.goto("https://www.crowdservices.it")

	// Get the "viewport" of the page, as reported by the page.
	const dimensions = await page.evaluate(() => {
		return {
			title: document.title,
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight,
			deviceScaleFactor: window.devicePixelRatio,
		}
	})

	//console.log("Dimensions:", dimensions)

	await browser.close()
	return dimensions
}

module.exports.run = run
