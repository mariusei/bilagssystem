import * as React from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

import logo from "../images/sv.png"

const Header = ({ siteTitle }) => (
  <header
    style={{
      margin: `0 auto`,
      padding: `var(--space-4) var(--size-gutter)`,
      display: `flex`,
      alignItems: `center`,
      justifyContent: `space-between`,
    }}
  >
    <Link
      to="/"
      style={{
        fontSize: `var(--font-sm)`,
        textDecoration: `none`,
      }}
    >
      {siteTitle}
    </Link>

    <Link
      to="/app/bilag"
      style={{
        fontSize: `var(--font-lg)`,
        textDecoration: `underline`,
      }}
    >
      Registrer bilag
    </Link>

    <Link
      to="/app/faktura"
      style={{
        fontSize: `var(--font-lg)`,
        textDecoration: `underline`,
      }}
    >
      Lag faktura
    </Link>
    
    <img
      src={logo}
      height={40}
      style={{ margin: 0 }}
    />
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
