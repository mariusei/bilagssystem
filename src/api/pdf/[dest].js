import { google } from 'googleapis';
const { Readable } = require('stream')

async function handler(req, res) {

    const { dest } = req.params

    let oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.APP_HOSTNAME
    )

    if (!dest || (dest !== "attachment" && dest !== "invoice")) {
      return res.status(400).json({ message: "Invalid PDF destination", error: "dest path is lacking" })
    }

    let parents = [] 


    try {
        const token = JSON.parse(req.headers.authorization)
        if (token.access_token === undefined) throw "No access token was provided"

        if (dest === "attachment") {
            parents = [process.env.DRIVE_PARENT]
        }

        if (dest === "invoice") {
            parents = [process.env.INVOICE_DRIVE_PARENT]
        }

        // Received data from user:
        // console.log("recevied PDF:", req.files)
        // console.log("received PDF headers:", req.headers)

        oauth2Client.setCredentials(token)

        let drive = google.drive({version: 'v3', auth: oauth2Client});
        let fileMetadata = {
            'name': req.files[0].originalname,
            'parents': parents 
        };

        var s = new Readable()
        s.push(req.files[0].buffer)
        s.push(null)


        let media = {
            mimeType: 'application/pdf',
            body: s
        };
        try {
            let file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
            });
            //console.log('File Id:', file.data.id);
            //console.log("PDF FILE RESPONSE: ", file.data)

            oauth2Client = null
            drive = null

            return res.status(200).json({ 
                message: "All PDF file uploading OK",
                urlFile: "https://drive.google.com/file/d/" 
                    + file.data.id
                    + "/view",
                urlFolder: "https://drive.google.com/drive/folders/"
                    + process.env.DRIVE_PARENT
            })
        } catch (err) {
            // TODO(developer) - Handle error
            console.error("Error in addPDF:", err)
            throw err;
        }


    } catch (err) {
      console.error("An error:", err)
      return res.status(500).json({ message: "There was an error", error: String(err) })
    }}

//module.exports = handler
export default handler