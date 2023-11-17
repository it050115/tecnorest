const options = {
	account: "crc@crowdservices.it",
	sender: "noreply@scaitecno.it",
	recipient: "crc@crowdservices.it",
	query: "from:(sd_como@maticmind.it) label:[ONECALL]",
	//query: "from:(sd_como@maticmind.it) !label:[ONECALL]",
	//query: "label:[testsingle] ",
	queryLimit: 1,
	templatePath: "./templates",
	label: { name: "[ONECALL]", textColor: "#999999", backgroundColor: "#ffad46" },
}

module.exports = { options }
