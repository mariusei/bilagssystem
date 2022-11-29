let { google } = require("googleapis");

export default async function handler(req, res) {

  let oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.APP_HOSTNAME
  )

  try {
    let token = JSON.parse(req.headers.authorization)
    if (token.access_token) {

      oauth2Client.setCredentials(token)      
      let sheets = google.sheets({version: 'v4', auth: oauth2Client})

      if (sheets === undefined) {
        console.error("API: sheets couldn't be found/is undefined")
        return res.status(500).json({ message: "There was an error" })
      }

      let sheetRes = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID, 
        range: process.env.INFO_SHEET_RANGE, 
      })

      oauth2Client = null
      sheets = null 

      let rows = sheetRes.data.values;
      if (rows.length) {

        return res.status(200).json({
          name : rows[0][1],
          shortName : rows[1][1],
          orgNo : rows[2][1],
          postalAddress : rows[4][1],
          emailToOrg : rows[6][1],
          emailToLeader : rows[7][1],
          incomeAccount : rows[9][1],
          spendingsAccount : rows[9][1],
        })

      } else {
        //console.log('No data found.');

        return res.status(204).json({
          message: "No data was found."
        })
      }
      

      //return res.status(200).json({
      //  expenseTypes: ["test", "test 2"],
      //  bankAccounts: ["bn 17", 'bk32']
      //})

      //return res.status(200).json({ message: "sheet info downloaded" })
    } else {
      return res.status(403).json({ message: "auth token not found" })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "There was an error", error: err })
  }

  return res.status(500).json({ message: "There was an error", error: "empty response"})

}