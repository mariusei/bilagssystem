const { google } = require("googleapis")
const { Readable } = require('stream')

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET

let oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  process.env.APP_HOSTNAME
)


//const handler = async (req, res) => {

export default async function handler(req, res) {
    try {
        const token = JSON.parse(req.headers.authorization)
        if (token.access_token === undefined) throw "No access token was provided"

        // Received data from user:
        console.log("recevied PDF:", req.files)
        console.log("received PDF headers:", req.headers)

        oauth2Client.setCredentials(token)


        const drive = google.drive({version: 'v3', auth: oauth2Client});
        const fileMetadata = {
            'name': req.files[0].originalname,
            'parents': [process.env.DRIVE_PARENT]
        };

        var s = new Readable()
        s.push(req.files[0].buffer)
        s.push(null)


        const media = {
            mimeType: 'application/pdf',
            body: s
        };
        try {
            const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
            });
            console.log('File Id:', file.data.id);
        } catch (err) {
            // TODO(developer) - Handle error
            console.error("Error in addPDF:", err)
            throw err;
        }

        return res.status(200).json({ message: "All PDF file uploading OK"})

    } catch (err) {
      console.log("An error:", err)
      return res.status(500).json({ message: "There was an error", error: err })
    }}

//module.exports = handler