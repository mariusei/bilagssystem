// If you don't want to use TypeScript you can delete this file!
import * as React from "react"
import { PageProps, Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import { navigate } from "gatsby"


type DataProps = {
  site: {
    buildTime: string
  }
}



const isBrowser = typeof window !== "undefined"


const IndexPage: React.FC<PageProps<DataProps>> = ({
  data,
  location,
}) => {

  
  return (
    <Layout>
      <Seo title="Registrer bilag" />
      <h1>
        Registrer bilag
      </h1>
      <button
        onClick={() => {
          // Functions are not a client-side route, so we hit the server-side route to login.
          if (isBrowser) {
            window.location.replace("/api/login")
          }
        }}
      >
        Sign in with Google
      </button>

      <pre>{data.site.buildTime}</pre>
      <Link to="/">Startside</Link>
    </Layout>
  )
  }

export default IndexPage

export const query = graphql`
  {
    site {
      buildTime(formatString: "YYYY-MM-DD hh:mm a z")
    }
  }
`
