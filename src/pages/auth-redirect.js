import React, { useEffect } from "react"
import qs from "query-string"

import Layout from "../components/layout"
import { navigate } from "gatsby"


export default function AuthRedirect({ location }) {
  // Get the code set as the token in the query params from googleAccessToken function.
  const query = qs.parse(location?.search)

  useEffect(() => {
    localStorage.setItem(`google:tokens`, query.token)
  
    // After setting token in localStorage, go to app homepage.
    setTimeout(() => {
      navigate("/app/")
    }, 1000)
  })

  return (
    <Layout>
    <h1>Vellykket innlogging</h1>
    <p>
      Lagrer Google token info i local storage...
    </p>
    </Layout>
  )
}