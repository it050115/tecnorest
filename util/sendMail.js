const log = require("../util/log")(__filename)
const nodemailer = require("nodemailer")

let transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: "noreply@crowdservices.it",
		pass: "<Ujz<76%5jhh6y3hdas77jz>",
		//user: "hda@crowdservices.it",
		//pass: "W3bSph3r3",
	},
})

const sendMail = (to, subject, body) => {
	//console.dir(body)
	message = {
		from: "noreply@crowdservices.it",
		to: to,
		subject: subject,
		text: body.stack || body, //body.stack ? body.stack : body,
		//html: "<strong>Restbox error</strong><p>" + body + "</p>",
		html: `
			<html>
			<head>
			<meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>${subject}</title>
			<style type="text/css">
			<!--
			.style3 {
			font-family: Verdana, Arial, Helvetica, sans-serif;
			font-size: 13px;
			color: #003366;
			}
			-->
			</style>
			</head>
			<body bgcolor="#FFFFFF" text="#000000">
				<table width="99%" align="center" cellpadding="10" cellspacing="0" style="border: 1px solid lightgray">
					<tr bgcolor="#f39c12">
						<td valign="top">                          
							<strong>${subject}</strong>
						</td>
					</tr>
					<tr>
							<td width="99%" valign="top">
								<table width="99%" border="0" cellspacing="0" cellpadding="10">
									<tr>
											<td>
												<font face="verdana" size="2" color="#003366">
													<p align="justify">${body.stack ? body.stack : body}</p>
												</font>
									</td>
									</tr>
							</table>
						</td>
					</tr>
				</table>
			</body>
			</html>`,
	}

	transporter.sendMail(message, function (err, info) {
		if (err) {
			log.error(err)
			return false
		} else {
			log.warn("Notification sent to " + info.accepted)
			return true
		}
	})
}

module.exports.sendMail = sendMail
