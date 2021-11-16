import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Navbar, Container, Nav } from 'react-bootstrap'
import { 
  accountSelector,
  daiSelector,
  daiBalanceSelector
} from '../store/selectors'
import { loadDaiBalance } from '../store/interactions'

<Navbar>
  <Container>
    <Navbar.Brand href="#home">Navbar with text</Navbar.Brand>
    <Navbar.Toggle />
    <Navbar.Collapse className="justify-content-end">
      <Navbar.Text>
        Signed in as: <a href="#login">Mark Otto</a>
      </Navbar.Text>
    </Navbar.Collapse>
  </Container>
</Navbar>

class AppNavbar extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props)
  }
  async loadBlockchainData(props) {
    const { dispatch, dai, account } = props
    await loadDaiBalance(dai, dispatch, account)
  }
  render() {
    return (
      < Navbar bg="primary" expand = "lg" className= "navbar-dark">
        <Container fluid>
          <Navbar.Brand href="#/">Make It Happen</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end navbar-dark">
            <Nav className ="me-auto">
              <Nav.Link variant="navbar-dark" href="https://oasis.app/">
                DAI Balance:<strong> ${this.props.daiBalance} </strong>
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