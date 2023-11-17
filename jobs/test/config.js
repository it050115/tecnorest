const options = {
	//account: "admin.farina@crowdservices.it", //hda@crowdservices.it
	//sender: "noreply@crowdservices.it",
	//recipient: "guglielmo.farina@crowdservices.it", //hda@crowdservices.it

	account: "hda@crowdservices.it",
	sender: "noreply@crowdservices.it",
	recipient: "hda@crowdservices.it",
	query: "from:(canon.it) subject:(I: Shipments for Canon IT) has:attachment label:[TEST]",
	queryRtfNotification: "from:(it@support.canon-europe.com) subject:(NOTIFICA RTF) !label:[TEST]",
	//query: "from:(@okcopy.it) has:attachment !label:[HDA]", // subject:ct13117
	queryLimit: 6,
	templatePath: "./templates",
	label: { name: "[HDA]", textColor: "#999999", backgroundColor: "#ffad46" },
}

const model = {
	shipto: null,
	partnumber: null,
	description: null,
	qta: null,
	waybill: null,
	ordernumber: null,
	date: null,
	contact: null,
	address: null,
	cap: null,
	city: null,
	courier: null,
}

const part = {
	date: null,
	warehouse: null,
	ordernumber: null,
	qta: null,
	partnumber: null,
	idcliente: "C10C",
}

module.exports = { options, model, part }
