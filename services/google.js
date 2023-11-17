const log = require("../util/log")(__filename)
const path = require("path")
const config = require("../config/environment.js")()
const { formatBytes, formatType, getMimeType, getGoogleMimeType } = require("../util/util")
const { google } = require("googleapis")
//const base64 = require("js-base64")
const fs = require("fs")
const fsPromises = require("fs").promises
const readline = require("readline")
const MailComposer = require("nodemailer/lib/mail-composer")
const { versionSuffix } = require("oracledb")

// https://developers.google.com/drive/api/v3/reference/permissions
// https://developers.google.com/drive/api/guides/manage-shareddrives
// https://developers.google.com/drive/api/v3/reference
// https://github.com/googleworkspace/node-samples
// https://github.com/googleapis/google-api-nodejs-client#samples
// https://console.cloud.google.com/iam-admin/iam?orgonly=true&project=crowdservices-gest&supportedpurview=organizationId

const SCOPES = ["https://mail.google.com/", "https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/calendar"]
const GSCOPES = ["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/compute", "https://www.googleapis.com/auth/compute.readonly"]
const PROJECT_ID = "crowdservices-gest"
//'https://www.googleapis.com/auth/drive.metadata.readonly'

class Google {
	constructor(subject) {
		this.gmail
		this.drive
		this.compute
		this.subject = subject
		this.auth

		//log.debug("Connected to Google Workspace as " + subject)
	}

	getAuth = () => {
		if (!this.auth) {
			this.auth = new google.auth.JWT({
				keyFile: config.common.keyFile,
				scopes: SCOPES,
				subject: this.subject,
			})
		}
		return this.auth
	}

	/**
	 * Get Virtual Machines for the GCLOUD_PROJECT
	 * https://github.com/googleapis/google-api-nodejs-client#service-account-credentials
	 */
	getVMs = async () => {
		const { auth, compute } = await this.getCompute()
		const result = await compute.instances.aggregatedList({
			auth: auth,
			project: PROJECT_ID,
		})

		const vms = result.data.items["zones/europe-west1-b"]
		console.log("VMs:", vms)
	}

	getFirewallRule = async (rule) => {
		const { auth, compute } = await this.getCompute()
		var request = {
			project: PROJECT_ID,
			firewall: rule,
			auth,
		}
		compute.firewalls.get(request, function (err, response) {
			if (err) {
				console.error(err)
				return
			}
			console.log(response)
		})
	}

	setFirewallRule = async (rule) => {
		const { auth, compute } = await this.getCompute()
		var request = {
			project: PROJECT_ID,
			firewall: rule,
			resource: {
				description: "SCAI Milano - 195.103.0.194/32\n" + "CROWD Mecenate Cablata - 109.168.10.114/32\n" + "CROWD Mecenate WiFI - 62.94.127.106/32\n" + "TIM CASA Monza - 5.170.24.0/24 - 5.170.28.0/24\n",
				sourceRanges: ["195.103.0.194/32", "109.168.10.114/32", "62.94.127.106/32", "5.170.24.0/24", "5.170.28.0/24"],
			},
			auth,
		}
		compute.firewalls.patch(request, function (err, response) {
			if (err) {
				console.error(err)
				return
			}
			console.log(response)
		})
	}

	/**
	 * Create AuthClient and compute instance for gcp
	 * @returns compute
	 */
	getCompute = async () => {
		if (!this.compute) {
			const auth = new google.auth.GoogleAuth({
				keyFile: config.common.adminKeyFile,
				scopes: GSCOPES,
			})
			const authClient = await auth.getClient()
			const compute = google.compute("v1")
			this.compute = { auth: authClient, compute }
		}
		return this.compute
	}

	/**
	 * Get Gmail instance
	 * @returns gmail instance
	 */
	getGmail = () => {
		if (!this.gmail) {
			this.gmail = google.gmail({ version: "v1", auth: this.getAuth() })
		}
		return this.gmail
	}

	/**
	 * Get Drive instance
	 * @returns
	 */
	getDrive = () => {
		if (!this.drive) {
			this.drive = google.drive({ version: "v3", auth: this.getAuth() })
		}
		return this.drive
	}

	/**
	 * Get header field/value
	 * @param {*} json
	 * @param {*} fieldName
	 * @returns
	 */
	getHeader = (json, fieldName) => {
		return json.payload.headers.filter(function (header) {
			return header.name === fieldName
		})[0].value
	}

	/**
	 * Lists the labels in the user's account.
	 * @param {google.auth.OAuth2} auth An authorized OAuth2 client. */
	getLabels = () => {
		this.getGmail().users.labels.list(
			{
				userId: "me",
			},
			(err, res) => {
				if (err) return log.error("The API returned an error: " + err)
				const labels = res.data.labels
				if (labels.length) {
					labels.forEach((label) => {
						log.info(`- ${label.name} - ${label.id}`)
					})
				} else {
					log.warn("No labels found.")
				}
			}
		)
	}

	getLabel = async (labelName) => {
		const gmail = this.getGmail()
		let result = null
		return await new Promise(function (resolve, reject) {
			gmail.users.labels.list(
				{
					userId: "me",
				},
				(err, res) => {
					if (err) {
						reject(err)
					}
					const labels = res.data.labels
					if (labels.length) {
						labels.forEach((label) => {
							if (label.name == labelName) {
								//log.info(`- ${label.name} - ${label.id}`)
								result = label
							}
						})
					}
					resolve(result)
				}
			)
		})
	}

	applyLabel = async (messageId, labelId) => {
		const res = await this.getGmail().users.messages.modify({
			userId: "me",
			id: messageId,
			requestBody: {
				addLabelIds: [labelId],
			},
		})
		return true
	}

	removeLabel = async (messageId, labelId) => {
		const res = await this.getGmail().users.messages.modify({
			userId: "me",
			id: messageId,
			requestBody: {
				removeLabelIds: [labelId],
			},
		})
		return true
	}

	createLabel = async (label) => {
		const { name, textColor, backgroundColor } = label
		const gmail = this.getGmail()
		return await new Promise(function (resolve, reject) {
			gmail.users.labels.create(
				{
					userId: "me",
					resource: {
						name,
						labelListVisibility: "labelShow",
						messageListVisibility: "show",
						color: { textColor, backgroundColor },
					},
				},
				(err, res) => {
					if (err) {
						reject(err)
					}
					resolve(res.data)
				}
			)
		})
	}

	deleteLabel = (labelId) => {
		this.getGmail().users.labels.delete(
			{
				userId: "me",
				id: labelId,
			},
			(err, res) => {
				if (err) {
					throw err
				}
			}
		)
	}

	/**
	 * List Gmail Messages
	 * @param {*} auth
	 * @param {*} maxResults : default 1
	 */
	getMessages = async (query, maxResults) => {
		//log.debug("- Getting mailbox messages [" + query + "]")
		const res = await this.getGmail().users.messages.list({
			userId: "me",
			q: query,
			maxResults: maxResults > 0 ? maxResults : 1,
		})
		return res.data.messages
	}

	/**
	 * Get single Email message ditails
	 * @param {*} msgId
	 */
	getMessage = async (messageId) => {
		const res = await this.getGmail().users.messages.get({
			userId: "me",
			id: messageId,
		})

		return res.data
	}

	getMessageInfo = (message) => {
		let date = this.getHeader(message, "Date")
		let d = new Date(date)
		const options = {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			timeZoneName: "short",
		}

		//date = new Date(date).toISOString().replace(/T/, " ").replace(/\..+/, "")
		date = d.toLocaleString("it-IT", options).replace(",", "")
		let subject = this.getHeader(message, "Subject")
		let from = this.getHeader(message, "From")
		//log.debug(`messageId:${messageId} - ${date} - ${from} - ${subject}`)
		//log.debug(`- msg: ${date} - ${from} - ${subject}`)
		return `${date} - ${from} - ${subject}`
		//return `${date} - `
	}

	getMessageSummary = (message) => {
		let date = this.getHeader(message, "Date")
		let d = new Date(date)

		/*let offset = +1
		let utc = d.getTime() + d.getTimezoneOffset() * 60000
		let newDateWithOffset = new Date(utc + 3600000 * offset)*/

		const options = {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			timeZoneName: "short",
		}

		//date = new Date(date).toISOString().replace(/T/, " ").replace(/\..+/, "")
		date = d.toLocaleString("it-IT", options).replace(",", "")
		const subject = this.getHeader(message, "Subject")
		const from = this.getHeader(message, "From")
		const summary = `${date} - ${from} - ${subject}`

		return { date, from, subject, summary }
	}

	/**
	 * https://stackoverflow.com/questions/49018323/how-to-send-an-email-with-attachment-using-gmail-api-in-node-js
	 * @param {*} options
	 */
	sendMessage = async (options) => {
		const gmail = this.getGmail()
		await new Promise(function (resolve, reject) {
			let mail = new MailComposer(options)
			mail.compile().build(async (error, msg) => {
				if (error) {
					reject(error)
					return log.error("Error compiling email " + error)
				}

				const encodedMessage = Buffer.from(msg).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
				gmail.users.messages.send(
					{
						userId: "me",
						resource: {
							raw: encodedMessage,
						},
					},
					(err, result) => {
						if (err) {
							reject(err)
							return log.error("sendMessage() - The API returned an error: " + err)
						}
						//log.debug("- email sent to HDA Inbound") //, result.data)
						resolve(true)
					}
				)
			})
		})
	}

	/**
	 * Get Attachment data
	 * @param {*} gmail
	 * @param {*} attachId
	 * @param {*} msgId
	 */
	getAttachment = async (messageId, attachmentId, fileName) => {
		//https://www.browserling.com/tools/file-to-base64
		const attachmentPath = path.resolve(config.filePath, fileName)
		const { data: attachment } = await this.getGmail().users.messages.attachments.get({
			"id": attachmentId,
			"messageId": messageId,
			"userId": "me",
		})
		const { size, data: dataB64 } = attachment

		//await fsPromises.mkdir(dirname, { recursive: true }) //FIXME Subdirectory?
		await fsPromises.writeFile(attachmentPath, Buffer.from(dataB64, "base64"))

		return {
			filename: fileName,
			filepath: attachmentPath,
			size: size,
			content: dataB64,
			encoding: "base64",
		}
	}

	readFile = async (f) => {
		// Creating a readable stream from file
		const file = readline.createInterface({
			input: fs.createReadStream(f),
			output: process.stdout,
			terminal: false,
		})
		// Reading file line by line by listening on the
		// line event which will triggered whenever a new line is read from the stream
		let i = 0
		file
			.on("line", (line) => {
				//console.log(i++ + line)
				//FIXME logic here
			})
			.on("close", () => {
				log.warn("File should be parsed on.line then deleted")

				//deleteFile(f)
			})
	}

	deleteFile = async (file) => {
		fs.unlink(file, function (err) {
			if (err) {
				log.error(err.toString())
			} else {
				log.info(file + " deleted")
			}
		})
	}

	listTeamDrives = async () => {
		let pageToken = null
		const teamdrives = await this.getDrive().teamdrives.list({
			useDomainAdminAccess: true,
			pageSize: 100,
			pageToken: pageToken ? pageToken : "",
			fields: "nextPageToken, teamDrives(id, name)", //id, name
		})
		return teamdrives.data
	}

	/**
	 * uploadFileInTeamDrive
	 * @param {*} teamDriveId
	 * @returns
	 */
	uploadFileInTeamDrive = async (sourceFile, targetFile, extension, driveId) => {
		log.debug(`uploadFileInTeamDrive(${targetFile}.${extension})`)

		const sourceFileSize = fs.statSync(sourceFile).size
		log.debug(" - source:" + sourceFile + " -size:" + sourceFileSize)

		const res = await this.getDrive().files.create(
			{
				resource: {
					name: `${targetFile}.${extension}`,
					mimeType: getGoogleMimeType(extension),
					parents: [driveId],
				},
				media: {
					mimeType: getMimeType(extension),
					body: fs.createReadStream(sourceFile),
				},
				fields: "id, name, parents",
				supportsAllDrives: true,
			},
			{
				// Use the `onUploadProgress` event from Axios to track the number of bytes uploaded
				onUploadProgress: (evt) => {
					const progress = (evt.bytesRead / sourceFileSize) * 100
					readline.clearLine(process.stdout, 0)
					readline.cursorTo(process.stdout, 0)
					process.stdout.write(`${Math.round(progress)}% complete\n`)
				},
			}
		)
		return res.data
	}

	/**
	 * Get Team Drive object by id
	 * @param {*} teamDriveId The object id of requested team drive
	 * @returns [Object] Team Drive Object
	 */
	getTeamDrive = async (teamDriveId) => {
		const teamdrive = await this.getDrive().teamdrives.get({
			teamDriveId,
			useDomainAdminAccess: true,
			fields: "id, name",
		})
		return teamdrive.data
	}

	/**
	 * Get Team Drive(s) (all if name is undefined)
	 * @param {*} name [String] Search term for drive name
	 * @returns [Array] Team Drives list or [Object] if one is found
	 */
	getTeamDrives = async (name) => {
		let q = ""
		let pageToken = ""
		let teamDriveList = []
		if (name !== undefined && name.length > 0) q = "name = '" + name + "'"

		do {
			const res = await this.getDrive().teamdrives.list({
				q: q,
				useDomainAdminAccess: true,
				fields: "nextPageToken, teamDrives(id, name)",
				pageToken: pageToken ? pageToken : "",
				pageSize: 100, //1 to 100, inclusive. (Default: 10)
			})
			if (res.data.teamDrives.length > 0) teamDriveList = [...teamDriveList, ...res.data.teamDrives]
			pageToken = res.data.nextPageToken
		} while (pageToken)

		return teamDriveList.length == 1 ? teamDriveList[0] : teamDriveList
	}

	listDrivePermissions = async (fileId) => {
		const res = await this.getDrive().permissions.list({
			fileId,
			supportsAllDrives: true,
			supportsTeamDrives: true,
			useDomainAdminAccess: true,
		})
		return res.data.permissions
	}

	getDrivePermissions = async (fileId, permissionId) => {
		const res = await this.getDrive().permissions.get({
			fileId,
			permissionId,
			fields: "emailAddress, role",
			supportsAllDrives: true,
			supportsTeamDrives: true,
			useDomainAdminAccess: true,
		})
		return res.data
	}

	/**
	 * Get Files in Drive
	 * https://gist.github.com/Alhamou/10d5dcfc338c4e5a33485029b6d23b9d
	 * @param {*} driveId The Drive
	 * @param {*} query [optional] query to perform. ("trashed=false" by default)
	 * @returns
	 */
	getFiles = async (driveId, query) => {
		let pageToken = ""
		let fileList = []
		let n = 0
		let q = "trashed=false"
		if (query !== undefined && query.length > 0) q = query + " and " + q

		do {
			const res = await this.getDrive().files.list({
				corpora: "drive",
				driveId,
				includeItemsFromAllDrives: true,
				useDomainAdminAccess: true,
				supportsAllDrives: true,
				pageSize: 100,
				q,
				//q: "trashed=false",
				//q: `'${driveId}' in parents and trashed=false`,
				//q: "'15nfWElOdnyDJm9jjAK11cPyozsUmPgFt' in parents and trashed=false", // WOW
				//q: "'0ANeV2VKmi_NIUk9PVA' in parents and trashed=false",
				//q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
				orderBy: "folder,name",
				pageToken: pageToken ? pageToken : "",
				fields: "nextPageToken, files(id, parents, name, lastModifyingUser, createdTime, modifiedTime, size, mimeType )", //,fileExtension)"
			})
			if (res.data.files.length > 0) fileList = [...fileList, ...res.data.files]
			//pageToken = res.data.nextPageToken
			n += 100
			console.log(n + ") record fetched")
		} while (pageToken)

		return fileList
	}

	//deleteme
	getFilesOk = async (driveId) => {
		const item = {
			id: null,
			folderId: null,
			name: null,
			createdBy: null,
			createdAt: null,
			modifiedAt: null,
			size: null,
			type: null,
			contents: "File number or file summary",
			description: "None",
		}
		const result = []

		let pageToken = null

		/*do {
			text += i + "<br>"
			i++
		} while (i < 5)*/

		const res = await this.getDrive().files.list({
			corpora: "drive",
			driveId,
			includeItemsFromAllDrives: true,
			useDomainAdminAccess: true,
			supportsAllDrives: true,
			pageSize: 10,
			q: "trashed=false",
			//q: `'${driveId}' in parents and trashed=false`,
			//q: "'15nfWElOdnyDJm9jjAK11cPyozsUmPgFt' in parents and trashed=false", // WOW
			//q: "'0ANeV2VKmi_NIUk9PVA' in parents and trashed=false",
			//q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
			orderBy: "folder,name",
			pageToken: pageToken ? pageToken : "",
			fields: "nextPageToken, files(id, parents, name, lastModifyingUser, createdTime, modifiedTime, size, mimeType )", //,fileExtension)", //id, name, parents
			//fields: "nextPageToken, files(*)",
		})
		const files = res.data.files
		//console.log(files)
		//console.log(res.data.nextPageToken)
		if (files.length) {
			files.map((file) => {
				//console.log(file)
				const spread = { ...item, ...{ id: file.id, folderId: file.parents[0], name: file.name, createdBy: file.lastModifyingUser.displayName, createdAt: file.createdTime, modifiedAt: file.modifiedTime, size: formatBytes(file.size), type: formatType(file.mimeType) } }
				//console.log(spread)
				result.push(spread)
			})
			if (res.data.nextPageToken) {
				//	this.getFiles(null, res.data.nextPageToken)
			}
		} else {
			console.log("No files found.")
		}

		return result
	}

	//deleteme
	getFilesOld = async (driveId) => {
		let pageToken = null
		const res = this.getDrive().files.list(
			{
				corpora: "drive", //https://developers.google.com/drive/api/guides/about-files#org
				//spaces: "drive",
				driveId,
				includeItemsFromAllDrives: true,
				supportsAllDrives: true,
				useDomainAdminAccess: true,
				pageSize: 3,
				//q: "'root' in parents",
				pageToken: pageToken ? pageToken : "",
				//q: "name='elvis233424234'",
				//fields: 'nextPageToken, files(*)',
				fields: "nextPageToken, files(id, name, trashed, parents)",
			},
			(err, res) => {
				if (err) return console.log("The API returned an error: " + err)
				const files = res.data.files
				if (files.length) {
					files.map((file) => {
						console.log(`${file.name} (${file.id}) in ${file.parents}`)
					})
					if (res.data.nextPageToken) {
						this.getFiles(null, res.data.nextPageToken)
					}
				} else {
					console.log("No files found.")
				}
			}
		)
	}
}

module.exports = Google
