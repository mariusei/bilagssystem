const { Readable } = require('stream')

const { google } = require("googleapis")
const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET

let oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  process.env.APP_HOSTNAME
)


const handler = async (req, res) => {
    try {
        const token = JSON.parse(req.headers.authorization)
        if (token.access_token === undefined) throw "No access token was provided"

        // Received data from user:
        console.log("recevied:", req.body)
        data = JSON.parse(req.body)

        oauth2Client.setCredentials(token)      
        const sheets = google.sheets({version: 'v4', auth: oauth2Client})
    
        if (sheets === undefined) {
            console.error("API: sheets couldn't be found/is undefined")
            return res.status(500).json({ message: "There was an error" })
        }

        var nRows = 0
        var nCol = 0
    
        // remote Google Sheet:
        const sheetRes = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID, 
            range: process.env.SHEET_RANGE,
        })

        const rows = sheetRes.data.values
        if (rows.length) {
            nRows = rows.length
            nCol = rows[0].length
            console.log(rows[0], nRows, nCol)
        } else {
            console.log('No data found.');
        }

        // Populate sheet with data that was received
        let dataToPost = new Array(nCol)

        dataToPost[0] = data.accountDate
        dataToPost[1] = data.description
        dataToPost[2] = data.attachmentNo
        dataToPost[data.expenseTypeColNo] = -data.amount
        let sign = 1
        if (data.expenseTypeColNo == '5') sign = -1
        dataToPost[data.creditColNo] = - sign * data.amount

        console.log("To POST:", dataToPost)

        const sheetPosted = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID, 
            range: process.env.SHEET_RANGE,
            valueInputOption: "USER_ENTERED",
            resource: {
                "majorDimension": "ROWS",
                values: [dataToPost]
            }
        })

        console.log("result from poST:", sheetPosted.data)

        return res.status(200).json({ message: "All OK - uploaded file" })


    } catch (err) {
      console.log("An error:", err)
      return res.status(500).json({ message: "There was an error", error: err })
    }}

module.exports = handler