const ticket = {
	"mandatory": [
		{ "name": "IDCLIENTE", "type": "NUMBER", "size": "10" },
		{ "name": "IDCLIENTEPROFILO", "type": "NUMBER", "size": "4" },
		{ "name": "IDACCOUNT", "type": "NUMBER", "size": "10" },
		{ "name": "IDASSET", "type": "NUMBER", "size": "10" },
		{ "name": "IDOPERATORE", "type": "NUMBER", "size": "4" },
		{ "name": "IDSEVERITA", "type": "NUMBER", "size": "3" },
		{ "name": "IDCODA", "type": "NUMBER", "size": "10" },
		{ "name": "IDCATEGORIAPROBLEMA", "type": "NUMBER", "size": "10", "function": "getProblemCategory" },
		{ "name": "IDSTATO", "type": "NUMBER", "size": "10" },
		{ "name": "DESCRIZIONEPROBLEMA", "type": "VARCHAR2", "size": "1500" },
		{ "name": "NOLOG", "type": "NUMBER", "size": "1" },
		{ "name": "IO", "type": "NUMBER", "size": "1" },
		{ "name": "UI", "type": "NUMBER", "size": "1" },
		{ "name": "REMOTEUSER", "type": "VARCHAR2", "size": "100" },
		{ "name": "ORIGINE", "type": "VARCHAR2", "size": "10" },
	],
	"optional": [
		{ "name": "USERDATE", "type": "DATE" },
		{ "name": "RIFCHIAMATA", "type": "VARCHAR2", "size": "20" },
		{ "name": "ADDINFO", "type": "VARCHAR2", "size": "20" },
		{ "name": "ASSEGNAZIONE", "type": "NUMBER", "size": "4", "function": "getAssegnazione" },
		{ "name": "FTPDATE", "type": "DATE" },
		{ "name": "IDCATEGORIARICHIESTA", "type": "NUMBER", "size": "10", "function": "getRequestCategory" },
		{ "name": "PHONE", "type": "VARCHAR2", "size": "25" },
		{ "name": "CONTACT", "type": "VARCHAR2", "size": "100" },
		{ "name": "EMAIL", "type": "VARCHAR2", "size": "60" },
		{ "name": "ESTIMATED", "type": "DATE" },
		{ "name": "NOTAINTERNA", "type": "VARCHAR2", "size": "1500" },
		{ "name": "NOTASERVIZIO", "type": "VARCHAR2", "size": "1500" },
		{ "name": "SUBJECT", "type": "VARCHAR2", "size": "1500" },
		{ "name": "SRCFILE", "type": "VARCHAR2", "size": "100" },
	],
}

const account = {
	"mandatory": [
		{ "name": "IDCLIENTEPROFILO", "type": "NUMBER", "size": "4" },
		{ "name": "ACCOUNT", "type": "VARCHAR2", "size": "300" },
		{ "name": "CREATEDBY", "type": "NUMBER", "size": "10" },
		{ "name": "UPDATEDBY", "type": "NUMBER", "size": "10" },
		{ "name": "INDIRIZZO1", "type": "VARCHAR2", "size": "100" },
		{ "name": "IDCLIENTE", "type": "NUMBER", "size": "10" },
		{ "name": "IDCOMUNE1", "type": "NUMBER", "size": "6" },
		{ "name": "PLACEID", "type": "VARCHAR2", "size": "10" },
	],
	"optional": [
		{ "name": "EMAIL1", "type": "VARCHAR2", "size": "70" },
		{ "name": "CIVICO1", "type": "VARCHAR2", "size": "10" },
		{ "name": "CONTATTO1", "type": "VARCHAR2", "size": "100" },
		{ "name": "TEL1", "type": "VARCHAR2", "size": "25" },
		{ "name": "UBICAZIONE", "type": "VARCHAR2", "size": "100" },
	],
}

const asset = {
	"mandatory": [
		{ "name": "IDASSETBRAND", "type": "NUMBER", "size": "10" },
		{ "name": "IDCLIENTEPROFILO", "type": "NUMBER", "size": "4" },
		{ "name": "CREATEDBY", "type": "NUMBER", "size": "10" },
		{ "name": "UPDATEDBY", "type": "NUMBER", "size": "10" },
		{ "name": "IDCLIENTE", "type": "NUMBER", "size": "10" },
		{ "name": "IDACCOUNT", "type": "NUMBER", "size": "10" },
		{ "name": "MODELLO", "type": "VARCHAR2", "size": "40" },
		{ "name": "IDASSETBRAND", "type": "NUMBER", "size": "10" },
		{ "name": "IDASSETTIPOLOGIA", "type": "NUMBER", "size": "10" },
	],
	"optional": [
		{ "name": "SERIALE", "type": "VARCHAR2", "size": "30" },
		{ "name": "CESPITE", "type": "VARCHAR2", "size": "30" },
		{ "name": "DESCRIZIONE", "type": "VARCHAR2", "size": "100" },
		{ "name": "RIFDDT", "type": "VARCHAR2", "size": "30" },
		{ "name": "DATADDT", "type": "DATE" },
		{ "name": "RIFORDINE", "type": "VARCHAR2", "size": "30" },
		{ "name": "DATAORDINE", "type": "DATE" },
		{ "name": "CIG", "type": "VARCHAR2", "size": "25" },
	],
}

const address = {
	"mandatory": [
		{ "name": "COMUNE", "type": "VARCHAR2", "size": "100" },
		{ "name": "CAP", "type": "VARCHAR2", "size": "8" },
		{ "name": "SIGLAPROVINCIA", "type": "VARCHAR2", "size": "3", "function": "getAddressFields" },
		{ "name": "PROVINCIA", "type": "VARCHAR2", "size": "100", "function": "getAddressFields" },
		{ "name": "REGIONE", "type": "VARCHAR2", "size": "50", "function": "getAddressFields" },
		{ "name": "SIGLAREGIONE", "type": "VARCHAR2", "size": "3", "function": "getAddressFields" },
		{ "name": "GEOGRAFIA", "type": "VARCHAR2", "size": "3", "function": "getAddressFields" },
		{ "name": "IDSETTORE", "type": "NUMBER", "size": "2", "function": "getAddressFields" },
		{ "name": "HASHCODE", "type": "VARCHAR2", "size": "32", "function": "getHashCode" },
	],
	"optional": [{ "name": "AREA", "type": "VARCHAR2", "size": "20", "function": "getAddressFields" }],
}

module.exports = { ticket, account, asset, address }
