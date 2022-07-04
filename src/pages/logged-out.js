import { Link } from "gatsby"
import React from "react"

import Layout from "../components/layout"

const LoggedOut = () => {
  return (
    <Layout>
      <h1>Du er logget ut!</h1>
      <Link to="/">
        Gå til startsiden
      </Link>
    </Layout>
  )
}

export default LoggedOut