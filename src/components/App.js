import React, { Component } from 'react';
import './App.css';
import Navbar from './Navbar'
import Content from './Content'
import { connect } from 'react-redux'
import { 
  loadWeb3,
  loadAccount,
  loadDai,
  loadCrowdfunder,
} from '../store/interactions'
import { 
  contractsLoadedSelector,
  daiLoadedSelector,
  accountSelector
} from '../store/selectors'

class App extends Component {

  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch)
    const networkId = await web3.eth.net.getId()
    await loadAccount(web3, dispatch)
    const dai = await loadDai(web3, dispatch)
    if(!dai) {
      window.alert('Dai smart contract not detected on the current network. Please select another network with Metamask.')
    }
    const crowdfunder = await loadCrowdfunder(web3, networkId, dispatch)
    if(!crowdfunder) {
      window.alert('Crowdfunder smart contract not detected on the current network. Please select another network with Metamask.')
    }
  }

  render() {
    return (
      <div>
        { this.props.loadNavbar ? < Navbar /> : <div className="dai"></div> }
        { this.props.contractsLoaded ? <Content /> : <div className="content"></div> }
      </div>
    );
  }
}

function mapStateToProps(state) {
  const daiLoaded = daiLoadedSelector(state)
  const account = accountSelector(state)
  return {
    loadNavbar: account && daiLoaded,
    contractsLoaded: contractsLoadedSelector(state)
  }
}
export default connect(mapStateToProps)(App)

