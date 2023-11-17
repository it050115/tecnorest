const fs = require("fs")
const { AlignmentType, Document, Footer, ImageRun, Header, HeadingLevel, PageNumber, NumberFormat, PageOrientation, Packer, Paragraph, TextRun, UnderlineType, Table, TableCell, TableRow } = require("docx")
// Documents contain sections, you can have multiple sections per document, go here to learn more about sections
// This simple example will only contain one section

//https://docx.js.org/#/?id=welcome

const doc1 = new Document({
	sections: [
		{
			headers: {
				default: new Header({
					children: [
						new Paragraph({
							children: [
								new ImageRun({
									data: fs.readFileSync("/Users/it050382/Node/tecnorest/images/cs-logo.jpeg"),
									transformation: {
										width: 100,
										height: 100,
									},
								}),
							],
						}),
					],
				}),
			},
			footers: {
				default: new Footer({
					children: [
						new Paragraph({
							children: [
								new ImageRun({
									data: fs.readFileSync("/Users/it050382/Node/restbox/images/cs-logo.jpeg"),
									transformation: {
										width: 100,
										height: 100,
									},
								}),
							],
						}),
					],
				}),
			},
			properties: {},
			children: [
				new Paragraph({
					children: [
						new TextRun("Hello World"),
						new TextRun({
							text: "Foo Bar",
							bold: true,
						}),
						new TextRun({
							text: "\twww.crowdservices.it",
							bold: true,
						}),
					],
				}),
			],
		},
	],
})

const doc2 = new Document({
	sections: [
		{
			children: [new Paragraph("Hello World")],
		},
		{
			properties: {
				page: {
					pageNumbers: {
						start: 1,
						formatType: NumberFormat.DECIMAL,
					},
				},
			},
			headers: {
				default: new Header({
					children: [new Paragraph("First Default Header on another page")],
				}),
			},
			footers: {
				default: new Footer({
					children: [new Paragraph("Footer on another page")],
				}),
			},

			children: [new Paragraph("hello")],
		},
		{
			properties: {
				page: {
					size: {
						orientation: PageOrientation.LANDSCAPE,
					},
					pageNumbers: {
						start: 1,
						formatType: NumberFormat.DECIMAL,
					},
				},
			},
			headers: {
				default: new Header({
					children: [new Paragraph("Second Default Header on another page")],
				}),
			},
			footers: {
				default: new Footer({
					children: [new Paragraph("Footer on another page")],
				}),
			},
			children: [new Paragraph("hello in landscape")],
		},
		{
			properties: {
				page: {
					size: {
						orientation: PageOrientation.PORTRAIT,
					},
				},
			},
			headers: {
				default: new Header({
					children: [
						new Paragraph({
							children: [
								new TextRun({
									children: ["Page number: ", PageNumber.CURRENT],
								}),
							],
						}),
					],
				}),
			},

			children: [new Paragraph("Page number in the header must be 2, because it continues from the previous section.")],
		},
		{
			properties: {
				page: {
					size: {
						orientation: PageOrientation.PORTRAIT,
					},
					pageNumbers: {
						formatType: NumberFormat.UPPER_ROMAN,
					},
				},
			},
			headers: {
				default: new Header({
					children: [
						new Paragraph({
							children: [
								new TextRun({
									children: ["Page number: ", PageNumber.CURRENT],
								}),
							],
						}),
					],
				}),
			},
			children: [new Paragraph("Page number in the header must be III, because it continues from the previous section, but is defined as upper roman.")],
		},
		{
			properties: {
				page: {
					size: {
						orientation: PageOrientation.PORTRAIT,
					},
					pageNumbers: {
						start: 25,
						formatType: NumberFormat.DECIMAL,
					},
				},
			},
			headers: {
				default: new Header({
					children: [
						new Paragraph({
							children: [
								new TextRun({
									children: ["Page number: ", PageNumber.CURRENT],
								}),
							],
						}),
					],
				}),
			},
			children: [new Paragraph("Page number in the header must be 25, because it is defined to start at 25 and to be decimal in this section.")],
		},
	],
})

doc1.addSection({
	children: [
		new Paragraph({
			children: [
				new TextRun({
					text: "DEMO TEST DOCUMENT",
				}),
				new TextRun({
					text: "DocDetailsData.docId",
				}),
			],
		}),
	],
})

const deleteFile = async (file) => {
	fs.unlink(file, function (err) {
		if (err) {
			throw new Error(err)
			//log.error(err.toString())
		}
	})
}

const run = async () => {
	try {
		const filepath = "/Users/it050382/Node/restbox/files/docsample.docx"
		// Used to export the file into a .docx file
		Packer.toBuffer(doc1).then((buffer) => {
			fs.writeFileSync(filepath, buffer)
		})
		//await deleteFile(filepath)
		return true
	} catch (err) {
		return false
	}
}

module.exports.run = run
