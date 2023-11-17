const options = {
	account: "hda@crowdservices.it",
	sender: "noreply@crowdservices.it",
	recipient: "hda@crowdservices.it",
	notifier: "guglielmo.farina@crowdservices.it",
	queryPartShipping: 'from:(canon.it) subject:("Manifest Spedizioni" | "Shipments for Canon IT") has:attachment !label:[HDA]',
	queryPartOrders: "from:(it@support.canon-europe.com) subject:(NOTIFICA RTF)",
	queryLimit: 3,
	templatePath: "./templates",
	label: { name: "[HDA]", textColor: "#999999", backgroundColor: "#ffad46" },
	warning: { name: "[WARN]", textColor: "#ffffff", backgroundColor: "#999999" },
	skip: { name: "[SKIP]", textColor: "#ffffff", backgroundColor: "#999999" },
}

module.exports = { options }
