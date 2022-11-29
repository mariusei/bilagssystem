import React, { useState, useEffect, useRef, createRef } from "react"
import { navigate } from "gatsby"
import { Router } from "@reach/router"

import PrivateRoute from "../components/privateRoute"
import StatusBar from "../components/statusbar"

import AttachmentPage from "../components/attachment"
import InvoicePage from "../components/invoice"

export default function App() {
  return (
    <>
      <Router>
        <PrivateRoute path="bilag" component={AttachmentPage} />
        <PrivateRoute path="faktura" component={InvoicePage} />
      </Router>
    </>
  )
}