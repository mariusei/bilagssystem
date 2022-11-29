
import * as React from "react"

import { Router } from "@reach/router"
import PrivateRoute from "../../components/privateRoute"

import Attachment from "../../components/attachment"
import Invoice from "../../components/invoice"

import Layout from "../../components/layout"

const App = () => {

  return (
    <Layout>
    <Router>
      <PrivateRoute path="/app/bilag" component={Attachment} />
      <PrivateRoute path="/app/faktura" component={Invoice} />
    </Router>
    </Layout>
  )
  
  }

export default App
