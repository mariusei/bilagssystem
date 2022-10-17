import { google } from 'googleapis';

const handler = async (req, res) => {

  let oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.APP_HOSTNAME
  )

  try {
    const token = JSON.parse(req.query.token)
    if (token.access_token) {
      await oauth2Client.revokeToken(token.access_token)
      let oauth2Client = null
      return res.status(200).json({ message: "token revoked" })
    } else {
      let oauth2Client = null
      return res.status(403).json({ message: "auth token not found" })
    }
  } catch (err) {
    let oauth2Client = null
    console.error(err)
    return res.status(500).json({ message: "There was an error", error: err })
  }
}


//module.exports = handler
export default handler