const { google } = require("googleapis")

const login = async (req, res) => {
  // Initialize the Google OAuth client.
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    // Redirect URL:
    // http://localhost:8000/api/googleAccessToken
    process.env.GOOGLE_REDIRECT_URI
  )

  google.options({ auth: oauth2Client })

  const scopes = ["profile", "https://www.googleapis.com/auth/drive"] 

  // "https://www.googleapis.com/auth/spreadsheets"]
  // Generate the callback URL with options.
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes.join(" "),
  })

  // Appends the ?code query param to the return URL from above.
  // Redirects to next Gatsby Function.
  return res.redirect(authorizeUrl)
}

export default login