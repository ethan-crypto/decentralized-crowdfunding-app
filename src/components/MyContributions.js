import React, { Component } from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tooltip, Tabs, Tab, Popover, PopoverHeader, PopoverBody } from 'react-bootstrap'
import Spinner from './Spinner'
import {
  crowdfunderSelector,
  accountSelector,
  web3Selector,
  myPendingRefundsSelector,
  myHeldContributionsSelector,
  myReleasedContributionsSelector,
  formattedContributionsLoadedSelector,
  contributionRefundingSelector,
  contributionSelector
} from '../store/selectors'
import { refundContributions } from '../store/interactions'


const showRefundAllButton = props => {
  return(
    <>
      <OverlayTrigger
        placement='auto'
        overlay={
          <Tooltip>
            <strong>${props.myPendingRefunds.refundTotal}</strong> in total
          </Tooltip>
        }
      >
        <button
          className="btn btn-primary btn-block btn-sm"
          onClick={(event) => {
            refundContributions(props.dispatch, props.web3, props.account, props.myPendingRefunds.contributions, props.crowdfunder)
          }}
        >
          Refund All
        </button>
      </OverlayTrigger>
    </>
  )
}


const renderMyContributions = (contributions, popover) => {
  return (
    <table className="table table-dark table-sm small">
      <thead>
        <tr>
          <th>Project</th>
          <th>Amount</th>
          <th>Supporter #</th>
          <th>Time</th>
        </tr>
      </thead> 
      <tbody>
        { contributions.map((contribution) => {
          return (
            <OverlayTrigger
              key={contribution.id}
              trigger = 'click'
              rootClose
              placement='left'
              overlay={popover(contribution.project)}
            >
              <tr 
                key={contribution.id}
                className="myContributions-contribution"
              >
                <td className={`text-${contribution.project.projectTypeClass}`}>{contribution.project.name}</td>
                <td>${contribution.formattedFundAmount}</td>
                <td>{contribution.supporterCount}</td>
                <td className="text-muted">{contribution.formattedTimestamp}</td>
              </tr>
            </OverlayTrigger>
          )
        }) }
      </tbody>        
    </table>

  )
}

const showMyContributions = props => {
  return(
    <Tabs defaultActiveKey="pendingRefund" className="bg-dark text-white">
      <Tab eventKey="pendingRefund" title="Pending Refund" className="bg-dark">
        { props.showRefundAllButton ? showRefundAllButton(props) : null }
        { renderMyContributions(props.myPendingRefunds.contributions, props.renderProjectPopover)}
      </Tab>
      <Tab eventKey="held" title="Held" className= "">
        { renderMyContributions(props.myHeldContributions, props.renderProjectPopover)}
      </Tab>
      <Tab eventKey="released" title="Released" className= "">
        { renderMyContributions(props.myReleasedContributions, props.renderProjectPopover)}
      </Tab>
    </Tabs>
  )
}

class MyContributions extends Component {

 render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          My Contributions
        </div>
        <div className="card-body">
          { this.props.showMyContributions ? showMyContributions(this.props) : <Spinner />}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const formattedContributionsLoaded = formattedContributionsLoadedSelector(state)
  const contributionRefunding = contributionRefundingSelector(state)
  const myPendingRefunds = myPendingRefundsSelector(state)
  const contribution = contributionSelector(state)
  console.log(myPendingRefunds)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    account: accountSelector(state),
    myPendingRefunds,
    myHeldContributions: myHeldContributionsSelector(state),
    myReleasedContributions: myReleasedContributionsSelector(state),
    showMyContributions: !contributionRefunding && !contribution.loading && formattedContributionsLoaded,
    showRefundAllButton: myPendingRefunds.refundTotal > 0
  }
}

export default connect(mapStateToProps)(MyContributions);

