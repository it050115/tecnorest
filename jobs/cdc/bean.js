let bean = {}

/**
 *
 */
setBean = (data) => {
	return (bean = {
		idclienteprofilo: null, //must specified by agent caller
		userdate: null, //must specified by agent caller
		rifchiamata: data.CHIAMATA_REMOTO_OLD,
		addinfo: data.CHIAMATA_REMOTO_OLD,
		rifchiamata: data.CHIAMATA_REMOTO_OLD,
		phone: data.ACCOUNT_TELEFONO,
		email: data.ACCOUNT_EMAIL,
		referente: getContact(data.ACCOUNT_CONTATTO),
		contact: getContact(data.ACCOUNT_CONTATTO),
		contatto1: getContact(data.ACCOUNT_CONTATTO),
		modello: data.ASSET_MODELLO,
		seriale: data.ASSET_SERIALE,
		brand: data.ASSET_MARCA,
		tipologia: data.ASSET_TIPOLOGIA,
		indirizzo1: data.ACCOUNT_INDIRIZZO,
		comune: data.ACCOUNT_CITTA,
		cap: data.ACCOUNT_CAP,
		descrizioneproblema: data.DESCRIZIONE_PROBLEMA,
		//descrizioneproblema: "TESTING",
	})
}

module.exports = { setBean }

getContact = (str) => {
	return str.toUpperCase()
}
