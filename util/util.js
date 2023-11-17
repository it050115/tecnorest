const log = require("../util/log")(__filename)
const mime = require("mime")

const getMimeType = (extension) => {
	return mime.getType(extension)
}

const getExtension = (mimetype) => {
	return mime.getExtension(mimetype)
}

const formatBytes = (bytes, decimals) => {
	if (bytes === undefined || bytes == 0) return "0 Bytes"
	var k = 1024,
		dm = decimals || 1,
		sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

let map = null // store for performance
const getGoogleMimeType = (extension) => {
	const standardMimeType = mime.getType(extension)
	if (!map) {
		const mapReducer = (arr, [keys, val]) => [...arr, ...(Array.isArray(keys) ? [...keys.map((key) => [key, val])] : [[keys, val]])]
		const mp = new Map(
			[
				[["audio/mpeg", "audio/wav"], "application/vnd.google-apps.audio"],
				[["video/mpeg"], "application/vnd.google-apps.video"],
				[["image/jpeg", "image/png", "image/tiff"], "application/vnd.google-apps.photo"],
				[["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"], "application/vnd.google-apps.document"],
				[["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"], "application/vnd.google-apps.spreadsheet"],
				[["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"], "application/vnd.google-apps.presentation"],

				// [[""],""],
				//[["application/zip"], "application/vnd.google-apps.file"],
				[(null, "application/vnd.google-apps.unknown")],
			].reduce(mapReducer, [])
		)
		map = [...mp.entries()]
	}

	const result = map.find((k) => k.includes(standardMimeType))
	if (result != undefined) return result[1]
	log.warn("Missing mime conversion: " + standardMimeType)
	return "application/vnd.google-apps.file"
}

const formatType = (mimeType) => {
	switch (mimeType) {
		case "application/vnd.google-apps.folder":
			return "folder"
		case "text/plain":
			return "TXT"
		case "application/pdf":
			return "PDF"
		case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
			return "XLS"
		case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
			return "DOC"
		case "image/png":
			return "PNG"
		case "image/jpg":
		case "image/jpeg":
			return "JPG"
		default:
			return mimeType
	}
}

const getCurrentDate = () => {
	const now = new Date()
	const dd = ("0" + now.getDate()).slice(-2)
	const MM = ("0" + (now.getMonth() + 1)).slice(-2)
	const yyyy = now.getFullYear()
	return yyyy + MM + dd
}

module.exports = { formatType, formatBytes, getMimeType, getGoogleMimeType, getExtension, getCurrentDate }
