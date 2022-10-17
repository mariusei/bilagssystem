//import { google } from 'googleapis';
//
//export default async function handler(req, res) {
//
//  let oauth2Client = new google.auth.OAuth2(
//    process.env.GOOGLE_CLIENT_ID,
//    process.env.GOOGLE_CLIENT_SECRET,
//    process.env.APP_HOSTNAME
//  )
//
//  try {
//    const token = JSON.parse(req.headers.authorization)
//    if (token.access_token) {
//
//      oauth2Client.setCredentials(token)      
//      const sheets = google.sheets({version: 'v4', auth: oauth2Client})
//
//      if (sheets === undefined) {
//        console.error("API: sheets couldn't be found/is undefined")
//        return res.status(500).json({ message: "There was an error" })
//      }
//
//      sheets.spreadsheets.values.get({
//        spreadsheetId: process.env.SHEET_ID, 
//        range: process.env.SHEET_RANGE, 
//      }, (err, sheetRes) => {
//        if (err) {
//          console.error('The API returned an error: ' + err)
//          return res.status(500).json({
//            message: "API-en returnerte en feil",
//            error: err
//          })
//        }
//        const rows = sheetRes.data.values;
//        if (rows.length) {
//          // Fetch expense types
//          // 1st row: expense types:
//
//          let expenseTypes = {}
//          if (rows[0].length) {
//            rows[0].forEach((val, ix) => {if (ix > 4) { expenseTypes[ix] = val}})
//            //console.log(expenseTypes) // OK
//          } else {
//            console.error("row 0 didn't contain any data, fetcing from API")
//          }
//
//          // Fetch bank account
//          let bankAccounts =
//          {
//            "4": rows[0][4],
//            "5": rows[0][5]
//          }
//
//          // rows.map((row) => {
//          //   console.log(`${row[0]}, ${row[4]}`);
//          // });
//
//          return res.status(200).json({
//            expenseTypes: expenseTypes,
//            bankAccounts: bankAccounts
//          })
//
//        } else {
//          console.log('No data found.');
//        }
//      })
//
//      //return res.status(200).json({ message: "sheet info downloaded" })
//    } else {
//      return res.status(403).json({ message: "auth token not found" })
//    }
//  } catch (err) {
//    console.error(err)
//    return res.status(500).json({ message: "There was an error", error: err })
//  }
//}

//module.exports = handler


//import { google } from 'googleapis';
let { google } = require("googleapis");

//function getOauthClient() {
//  return new google.auth.OAuth2(
//    process.env.GOOGLE_CLIENT_ID,
//    process.env.GOOGLE_CLIENT_SECRET,
//    process.env.APP_HOSTNAME
//  )
//
//}

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
        range: process.env.SHEET_RANGE, 
      })

      oauth2Client = null
      sheets = null 
      //google = null

      //, (err, sheetRes) => {
      //  if (err) {
      //    console.error('The API returned an error: ' + err)
      //    return res.status(500).json({
      //      message: "API-en returnerte en feil",
      //      error: err
      //    })
      //  }

      let rows = sheetRes.data.values;
      if (rows.length) {
        // Fetch expense types
        // 1st row: expense types:

        let expenseTypes = {}
        if (rows[0].length) {
          rows[0].forEach((val, ix) => {if (ix > 4) { expenseTypes[ix] = val}})
          //console.log(expenseTypes) // OK
        } else {
          console.error("row 0 didn't contain any data, fetcing from API")
        }

        // Fetch bank account
        let bankAccounts =
        {
          "4": rows[0][4],
          "5": rows[0][5]
        }

        // rows.map((row) => {
        //   console.log(`${row[0]}, ${row[4]}`);
        // });

        return res.status(200).json({
          expenseTypes: expenseTypes,
          bankAccounts: bankAccounts
        })

      } else {
        console.log('No data found.');
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