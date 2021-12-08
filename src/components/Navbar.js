import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Navbar, Container, Nav } from 'react-bootstrap'
import { 
  accountSelector,
  daiSelector,
  daiBalanceSelector
} from '../store/selectors'

class AppNavbar extends Component {
  
  render() {
    return (
      < Navbar bg="primary" expand = "lg" className= "navbar-dark">
        <Container fluid>
          <Navbar.Brand href="#/">Make It Happen</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end navbar-dark">
            <Nav className ="me-auto">
              <Nav.Link variant="navbar-dark" href="https://oasis.app/">
              DAI Balance:<strong> {this.props.account?`$${this.props.daiBalance}`:null} </strong>
              </Nav.Link>
            </Nav> 
            <Nav>
              <Nav.Link href={`https://etherscan.io/address/${this.props.account}`}>
                {this.props.account}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    )
  }
}

function mapStateToProps(state) {
  return {
    account: accountSelector(state),
    dai: daiSelector(state),
    daiBalance: daiBalanceSelector(state)
  }
}

export default connect(mapStateToProps)(AppNavbar)