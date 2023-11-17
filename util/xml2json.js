const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser")
const fs = require("fs")

//https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4/2.XMLparseOptions.md

const xmlDataStr = fs.readFileSync("files/AndroidManifest.xml")

//const xmlDataStr = `<root a="nice" checked><a>wow</a></root>`

const options = {
	ignoreAttributes: false,
	attributeNamePrefix: "%_",
	allowBooleanAttributes: true,
}
const parser = new XMLParser(options)
const output = parser.parse(xmlDataStr)
console.log(output)
