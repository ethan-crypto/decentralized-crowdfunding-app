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
  loadBalances
} from '../store/interactions'
import { 
  contractsLoadedSelector,
  daiLoadedSelector,
  accountSelector
} from '../store/selectors'


class App extends Component {

  componentWillMount() {
    this.autoRefresh(this.props.dispatch)
  }

  async autoRefresh(dispatch) {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.autoRefreshOnNetworkChange = false; //prevent refresing while changing network
      this.loadBlockchainData(dispatch)
      /* Case 2 - User switch account */
      window.ethereum.on('accountsChanged', async (accounts) => {
        window.location.reload()
        this.loadBlockchainData(dispatch)
      });
      /* Case 3 - User switch network */
      window.ethereum.on('chainChanged', async (chainId) => {
        window.location.reload()
        this.loadBlockchainData(dispatch)
      });
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask: https://metamask.io/download.html')
    }
  }

  async loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch)
    const networkId = await web3.eth.net.getId()
    const account = await loadAccount(web3, dispatch)
    const dai = await loadDai(web3, dispatch)
    if (!dai) {
      window.alert('Dai smart contract not detected on the current network. Please select another network with Metamask.')
    }
    const crowdfunder = await loadCrowdfunder(web3, networkId, dispatch)
    if (!crowdfunder) {
      window.alert('Crowdfunder smart contract not detected on the current network. Please select ropsten network with Metamask.')
    }
    await loadBalances(web3, dispatch, dai, account)

  }

  render() {
    return (
      <div>
         < Navbar />
         {this.props.contractsLoaded ? <Content /> : <div className="content"></div>}
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

