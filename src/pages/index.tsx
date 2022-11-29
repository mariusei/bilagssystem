// If you don't want to use TypeScript you can delete this file!
import * as React from "react"
import { PageProps, Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import { navigate } from "gatsby"

import { Router } from "@reach/router"
import PrivateRoute from "../components/privateRoute"

import AttachmentPage from "../components/attachment"
import Invoice from "../components/invoice"

type DataProps = {
  site: {
    buildTime: string
  }
}

const NotLoggedIn: React.FC<any> = (data) => {
  return (
    <>
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
        Logg inn med Google
      </button>

      <Link to="/">Startside</Link>
    </>
  )
}



const isBrowser = typeof window !== "undefined"


      //<PrivateRoute path="/faktura" component={Invoice} />
const Index = () => {

  return (
    <Layout>
      <NotLoggedIn />
    </Layout>
  )
  
  }

export default Index
