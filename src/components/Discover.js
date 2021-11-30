import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Form, Card, Button } from 'react-bootstrap'
import Spinner from './Spinner'
import {
  crowdfunderSelector,
  daiSelector,
  discoverProjectsSelector,
  accountSelector,
  contributionSelector,
  web3Selector,
  formattedProjectsLoadedSelector,
  payWithEthSelector,
  ethCostLoadingSelector,
  ethCostSelector
} from '../store/selectors'
import {
  contributeToProject,
  quoteEthCost
} from '../store/interactions'
import {
  contributionAmountChanged,
  paymentMethodToggled
} from '../store/actions'

class Discover extends Component {

  render() {
    const {
      dispatch,
      web3,
      contribution,
      account,
      crowdfunder,
      dai,
      renderContent,
      discoverProjects,
      payWithEth,
      ethCostLoading,
      ethCost
    } = this.props
    return (
      <Card bg="dark" className="text-white">
        <Card.Header>
          Discover
          <Form.Switch
            id="custom-switch"
            label="Pay with ETH"
            onChange={(e) => {
              dispatch(paymentMethodToggled(e.target.checked))
              if(e.target.checked) quoteEthCost(dispatch, web3, contribution.amount, crowdfunder)
            }}
            checked={payWithEth}
          />
        </Card.Header>
        <div className="card-body">
          {this.props.showOpenProjects ?
            discoverProjects.map((project) => {
              return (
                <div className="card mb-4" key={project.id} >
                  <div className="card-header">
                    <small className="text-muted">{project.creator}</small>
                  </div>
                  <ul id="imageList" className="list-group list-group-flush">
                    {renderContent(project)}
                    <li key={project.id} className="list-group-item py-2">
                      <form className="row"
                        onSubmit={event => {
                          event.preventDefault()
                          contributeToProject(dispatch, web3, contribution.amount, ethCost, account, project.id, crowdfunder, dai)
                        }}
                        onBlur={event => {
                          event.preventDefault()
                          if (!event.currentTarget.contains(event.relatedTarget)) {
                            document.getElementById(project.id).value = ''
                          }
                        }}
                      >
                        <div className="col-sm mx-sm-auto pe-sm-1 mb-sm-auto py-2">
                          <input
                            type="number"
                            placeholder="DAI Amount"
                            id={project.id}
                            value={contribution.id !== project.id ? '' : contribution.amount}
                            onChange={event => {
                              dispatch(contributionAmountChanged(event.target.value, project.id))
                              if (payWithEth) quoteEthCost(dispatch, web3, event.target.value, crowdfunder)
                            }}
                            className="mx-0 form-control form-control-sm bg-dark text-white"
                            required />
                        </div>
                        <div className="col-sm-auto mx-sm-auto ps-sm-1 mb-sm-auto py-2">
                          <Button type="submit" className="btn btn-primary btn-block btn-sm" disabled={ethCostLoading}>Contribute</Button>
                        </div>
                      </form>
                      {payWithEth && ((ethCostLoading || ethCost > 0) && contribution.id === project.id)
                        ? <small>Cost: {ethCostLoading ? <Spinner type="small" />
                          : `${ethCost} ETH`}</small> : null}
                    </li>
                  </ul>
                </div>
              )
            })
            : <Spinner />}
        </div>
      </Card>
    )
  }
}

function mapStateToProps(state) {
  const contribution = contributionSelector(state)
  const formattedProjectsLoaded = formattedProjectsLoadedSelector(state)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    dai: daiSelector(state),
    account: accountSelector(state),
    discoverProjects: discoverProjectsSelector(state),
    contribution,
    payWithEth: payWithEthSelector(state),
    showOpenProjects: formattedProjectsLoaded && !contribution.loading,
    ethCostLoading: ethCostLoadingSelector(state),
    ethCost: ethCostSelector(state)
  }
}

export default connect(mapStateToProps)(Discover)
