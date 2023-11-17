require("dotenv").config()
require("../app.js")
const { app } = require("../services/server.js")
const chai = require("chai")
const chaiHttp = require("chai-http")
const chaiXml = require("chai-xml")
const chaiHtml = require("chai-html")
const should = require("chai").should()
const expect = require("chai").expect
const assert = require("chai").assert
const Mssql = require("../services/mssql.js")
const { NVarChar, Numeric, DateTime, Date: DateOnly } = require("mssql")
const Google = require("../services/google.js")
const { options } = require("./config.js")
const docx = require("../util/docx.js")
const scraper = require("../util/scraper/scraper3.js")
const html = require("../util/html.js")
const { html2pdf } = require("../util/html2pdf")
const { sendMail } = require("../util/sendMail")
const ssh = require("../jobs/certbot/agent.js")

chai.use(chaiHttp)
chai.use(chaiHtml)
chai.use(chaiXml)

/*before((done) => {
	app.on("Server ready", () => {
		done()
	})
})*/

describe("/Testing Nodejs Libraries", () => {
	it("should Connect via ssh", async () => {
		await ssh.test()
	})

	it("should GET one message from GMail", async () => {
		const google = new Google(options.account)
		const messages = await google.getMessages(options.queryPartOrders, 1)
		messages.length.should.be.above(0)
	})

	/*it("should Create a PDF from HTML", async () => {
		const response = await html2pdf(`<!DOCTYPE html>
		<html>
		<head>
			<title>HTML5</title>
		</head>
		<body>
			<h1>index page</h1>
			<div id="content">content</div>
		</body>
		</html>`)
		response.should.be.a("string")
		//response.length.should.be.above(0)
	})*/

	/*it("should SCRAP information from internet site", async () => {
		const response = await scraper.run()
		console.log(response)
		response.should.be.a("object")
	})*/

	it("should READ html file", async () => {
		const result = await html.getHTML("/Users/it050382/Node/restbox/test/index.html")
		const test = `<!DOCTYPE html>
<html>

<head>
   <title>HTML5</title>
</head>

<body>
   <h1>index page</h1>
   <div id="content">content</div>
</body>

</html>`
		expect(result).html.to.equal(test)
	})

	it("should CREATE and DELETE one document", async () => {
		const result = await docx.run()
		result.should.be.true
	})

	it("should Send email", async () => {
		const result = sendMail("guglielmo.farina@crowdservices.it", "A mail should be sent to me", "This is an automation message")
	})
})

describe("/Testing Rest API routes and database connections", () => {
	it("should GET all agents from MongoDB", async () => {
		const response = await chai.request(app).get("/api/v1/agents")
		response.should.have.status(200)
		response.body.should.be.a("array")
		response.body.length.should.be.above(0)
	})

	it("should GET all sites from Oracle", async () => {
		const response = await chai.request(app).get("/api/v1/sites")
		response.should.have.status(200)
		response.body.should.be.a("array")
		response.body.length.should.be.above(0)
	})

	it("should GET some records from MSSql", async () => {
		const mssql = new Mssql()
		const records = await mssql.executePreparedStatement(`select id, waybill, date, partnumber, ordernumber, qta  from Ticket_WS.dbo.PartShipping where ordernumber=@ordernumber`, [{ ordernumber: "5801040667" }], [{ name: "ordernumber", type: NVarChar }], [])
		records.recordsets[0].recordset.should.be.a("array")
		records.rowsAffected.should.be.above(0)
	})
})

describe("/Testing Soap Libraries", () => {
	it("should post a soap/Ws request", async () => {
		const response = await chai
			.request(app)
			.post("/ws/v1/greatings?wsdl")
			.type("xml")
			.send(
				`<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:rec="http://test.web.smg.ms1.eu.gxs.com/gxs/ms/ws/provider/services/receiveWS">
					<soap:Header>
						<Security>
							<Username>username</Username>
							<Password>password</Password>
						</Security>
					</soap:Header>
					<soap:Body>
						<rec:GreatingsRequest xmlns="http://crowdservices.it/">
							<message>id1:12:34:56:out42</message>
							<splitter>:</splitter>
							<actionrequest>upload</actionrequest>
							<userid>IT_CROWD_TPM</userid>
							<password>password</password>
						</rec:GreatingsRequest>
					</soap:Body>
				</soap:Envelope>`
			)
		response.should.have.status(200)
	})

	it("should POST a soap/Wsc request", async () => {
		const response = await chai.request(app).post("/ws/v1/upload").type("xml").send(`
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:rec="http://portal.crowdservices.it/receive">
		<soapenv:Header/>
		<soapenv:Body>
			<rec:receive>
				<rec:userid>IT_CROWD_TPM</rec:userid>
				<rec:password>password</rec:password>
				<inputData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
	<_1:SyncActivityTPIMessage xmlns:_1="urn:one:canon:tpi:messages:activity:1" xmlns:_1_1="urn:one:canon:cdm:messages:common:1" xmlns:_1_10="urn:one:canon:cdm:bie:product:1" xmlns:_1_11="urn:one:canon:cdm:bie:part:1" xmlns:_1_12="urn:one:canon:cdm:bie:address:1" xmlns:_1_2="urn:one:canon:cdm:messages:activity:1" xmlns:_1_3="urn:one:canon:cdm:bie:servicerequest:1" xmlns:_1_4="urn:one:canon:cdm:bie:contact:1" xmlns:_1_5="urn:one:canon:cdm:bie:resource:1" xmlns:_1_6="urn:one:canon:cdm:bie:activity:1" xmlns:_1_7="urn:one:canon:cdm:types:1" xmlns:_1_8="urn:one:canon:cdm:bie:skill:1" xmlns:_1_9="urn:one:canon:cdm:bie:customerproduct:1">
		<SourceSystemName>Siebel</SourceSystemName>
		<SenderID>Canon</SenderID>
		<ReceiverID>IT_CROWD_TPM</ReceiverID>
		<Transaction>
			<Version>1.0</Version>
			<MessageType>Request</MessageType>
			<ServiceName>SyncActivity</ServiceName>
		</Transaction>
		<MessageID>5D63D7B1-013D-4000-E000-05ACAC18C70B</MessageID>
		<SyncActivityMessage action="CREATE">
			<_1_1:Header>
				<_1_1:EntityName>PushSyncActivity</_1_1:EntityName>
				<_1_1:SourceApplication>Siebel</_1_1:SourceApplication>
				<_1_1:IntegrationID>5D63D1BC-013D-4000-E000-05ACAC18C70B</_1_1:IntegrationID>
			</_1_1:Header>
			<_1_2:ServiceRequestList>
				<_1_2:ServiceRequestDetails>
					<_1_3:ServiceRequestID>1-344471156</_1_3:ServiceRequestID>
					<_1_3:ServiceRequestNumber>1-5P37N8</_1_3:ServiceRequestNumber>
					<_1_3:Type>Provide Support - Hardware</_1_3:Type>
					<_1_3:Summary>Escalated - Planning</_1_3:Summary>
					<_1_3:AccountName>XYZ</_1_3:AccountName>
					<_1_3:ContactDetails>
						<_1_4:FirstName>Devang</_1_4:FirstName>
						<_1_5:LastName>Mandli</_1_5:LastName>
						<_1_4:Communication>
							<_1_4:Email>devang.mandli@capgemini.com</_1_4:Email>
						</_1_4:Communication>
					</_1_3:ContactDetails>
					<_1_2:ActivityList>
						<_1_2:SyncActivityDetails>
							<_1_6:ActivityID>1-5P37OS</_1_6:ActivityID>
							<_1_6:Type>Resolution - Onsite</_1_6:Type>
							<_1_6:SubTypeCode>Engineer visit - SLA</_1_6:SubTypeCode>
							<_1_6:PriorityCode>3-Medium</_1_6:PriorityCode>
							<_1_2:PlannedDates>
								<_1_7:Start>2012-11-06T16:03:41.000Z</_1_7:Start>
								<_1_7:End>2012-11-08T16:03:41.000Z</_1_7:End>
							</_1_2:PlannedDates>
							<_1_6:AssigneeID>IT_CROWD_TPM</_1_6:AssigneeID>
							<_1_2:Status>Created</_1_2:Status>
							<_1_2:SubStatus>Dispatched</_1_2:SubStatus>
							<_1_2:Contact>
								<_1_4:FirstName>Devang</_1_4:FirstName>
								<_1_5:LastName>Mandli</_1_5:LastName>
								<_1_4:WorkPhone>
									<_1_7:DialNumber>+919900000000</_1_7:DialNumber>
								</_1_4:WorkPhone>
							</_1_2:Contact>
							<_1_2:EffortMeasure>60</_1_2:EffortMeasure>
							<_1_2:SkillSetList>
								<_1_8:SkillSet>
									<_1_8:Name>Competency</_1_8:Name>
									<_1_8:Skill>
										<_1_8:Skill>
											<_1_8:LowChar1>Hardware</_1_8:LowChar1>
											<_1_8:LowChar2>MUSTHAVE</_1_8:LowChar2>
											<_1_8:LowChar3>Allround</_1_8:LowChar3>
										</_1_8:Skill>
									</_1_8:Skill>
								</_1_8:SkillSet>
							</_1_2:SkillSetList>
							<_1_2:MeterReadList>
								<_1_9:Meter>
									<_1_9:Name>101 TOTAL</_1_9:Name>
								</_1_9:Meter>
								<_1_9:Meter>
									<_1_9:Name>112 TOTAL BLACK LARGE</_1_9:Name>
								</_1_9:Meter>
								<_1_9:Meter>
									<_1_9:Name>113 TOTAL BLACK SMALL</_1_9:Name>
								</_1_9:Meter>
								<_1_9:Meter>
									<_1_9:Name>122 TOTAL COLOUR LARGE</_1_9:Name>
								</_1_9:Meter>
								<_1_9:Meter>
									<_1_9:Name>123 TOTAL COLOUR SMALL</_1_9:Name>
								</_1_9:Meter>
								<_1_9:Meter>
									<_1_9:Name>301 TOTAL PRINT</_1_9:Name>
								</_1_9:Meter>
							</_1_2:MeterReadList>
						</_1_2:SyncActivityDetails>
					</_1_2:ActivityList>
					<_1_2:CustomerProduct>
						<_1_2:CustomerProductDetails>
							<_1_10:DeviceID>1-1A8L-4484</_1_10:DeviceID>
							<_1_11:SerialID>JLY00527</_1_11:SerialID>
							<_1_11:DescriptionText>IR3100CN</_1_11:DescriptionText>
							<_1_10:ConnectivitySettings>
								<_1_10:Connectivity>false</_1_10:Connectivity>
							</_1_10:ConnectivitySettings>
							<_1_9:CustomerDescriptionText>IR3100CNGE Model</_1_9:CustomerDescriptionText>
							<_1_9:CustomerProductType>Hardware Device</_1_9:CustomerProductType>
							<_1_9:CustomerProductStatus>Installed Product</_1_9:CustomerProductStatus>
						</_1_2:CustomerProductDetails>
						<_1_2:CustomerProductLocation>
							<_1_9:Address>LONDON</_1_9:Address>
							<_1_9:City>FARIS RAWI</_1_9:City>
							<_1_9:Address2>XYZ,52 MOUNT STREET</_1_9:Address2>
							<_1_12:PostalCode>W1K 2SF</_1_12:PostalCode>
							<_1_12:Country>GB</_1_12:Country>
							<_1_9:Comment>52, MOUNT STREET</_1_9:Comment>
						</_1_2:CustomerProductLocation>
					</_1_2:CustomerProduct>
				</_1_2:ServiceRequestDetails>
			</_1_2:ServiceRequestList>
		</SyncActivityMessage>
	</_1:SyncActivityTPIMessage>
	]]></inputData>
			</rec:receive>
		</soapenv:Body>
	</soapenv:Envelope>`)
		response.should.have.status(200)
	})
})
