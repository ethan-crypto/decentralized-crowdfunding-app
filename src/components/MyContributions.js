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


const showMyPendingContributionRefunds = (props) => {
  const { myPendingRefunds, renderProjectPopover, dispatch, exchange, account } = props

  return(
    <tbody>
      { myPendingRefunds.contributions.map((contribution) => {
        return (
          <OverlayTrigger
            key={contribution.id}
            placement='left'
            overlay={renderProjectPopover(contribution.project)}
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
  )
}

const showMyHeldContributions = (props) => {
  /*
  const { myFilledOrders } = props
  return(
    <tbody>
      { myFilledOrders.map((order) => {
        return (
          <tr key={order.id}>
            <td className="text-muted">{order.formattedTimestamp}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
          </tr>
        )
      }) }
    </tbody>
  )
  */
}

const showMyReleasedContributions = (props) => {
  /*
  const { myFilledOrders } = props

  return(
    <tbody>
      { myFilledOrders.map((order) => {
        return (
          <tr key={order.id}>
            <td className="text-muted">{order.formattedTimestamp}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
            <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
          </tr>
        )
      }) }
    </tbody>
  )
  */
}



class MyContributions extends Component {

 render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          My Contributions
        </div>
        <div className="card-body">
          <Tabs defaultActiveKey="pendingRefund" className="bg-dark text-white">
            <Tab eventKey="pendingRefund" title="Pending Refund" className="bg-dark">
              { this.props.showRefundAllButton ? showRefundAllButton(this.props) : null }
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Supporter #</th>
                    <th>Time</th>
                  </tr>
                </thead>
                { this.props.showMyContributions ? showMyPendingContributionRefunds(this.props) : <Spinner type="table" />}
              </table>
            </Tab>
            <Tab eventKey="held" title="Held" className= "">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Supporter #</th>
                    <th>Time </th>
                  </tr>
                </thead>
                { this.props.showMyContributions ? showMyHeldContributions(this.props) : <Spinner type="table" />}
              </table>
            </Tab>
            <Tab eventKey="released" title="Released" className= "">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Supporter #</th>
                    <th>Time</th>
                  </tr>
                </thead>
                { this.props.showMyContributions ? showMyReleasedContributions(this.props) : <Spinner type="table" />}
              </table>
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const formattedContributionsLoaded = formattedContributionsLoadedSelector(state)
  const contributionRefunding = contributionRefundingSelector(state)
  const myPendingRefunds = myPendingRefundsSelector(state)
  console.log(myPendingRefunds)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    account: accountSelector(state),
    myPendingRefunds,
    showMyContributions: !contributionRefunding && formattedContributionsLoaded,
    showRefundAllButton: myPendingRefunds.refundTotal > 0
  }
}

export default connect(mapStateToProps)(MyContributions);

