import React, { Component } from 'react'
import { connect } from 'react-redux'
import { 
  accountSelector,
  daiSelector,
  daiBalanceSelector
} from '../store/selectors'
import { loadDaiBalance } from '../store/interactions'

class Navbar extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props)
  }
  async loadBlockchainData(props) {
    const { dispatch, dai, account } = props
    await loadDaiBalance(dai, dispatch, account)
  }
  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <a className="navbar-brand" href="#/">Make It Happen</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <a
              className="nav-link small"
              target="_blank"
              rel="noopener noreferrer"
            >
              {this.props.account}
            </a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link small"
              href= "https://oasis.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
             DAI Balance:<strong> ${this.props.daiBalance} </strong>
            </a>

          </li>
        </ul>
      </nav>
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

export default connect(mapStateToProps)(Navbar)