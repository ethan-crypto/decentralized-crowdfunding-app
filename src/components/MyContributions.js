import React, { Component } from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tooltip, Popover, PopoverBody, PopoverHeader } from 'react-bootstrap'
import Spinner from './Spinner'
import {
  crowdfunderSelector,
  accountSelector,
  web3Selector,
  myPendingContributionRefundsSelector,
  formattedContributionsLoadedSelector,
  contributionRefundingSelector,
} from '../store/selectors'
import { refundContribution } from '../store/interactions'

const projectInfo = project => {
  <Popover id="popover-positioned-auto">
    <Popover.Header >
      <small className="text-muted">{project.creator}</small>
    </Popover.Header>
    <Popover.Body>
      <strong>Holy guacamole!</strong> Check this info.
    </Popover.Body>
  </Popover>
}

const showMyPendingContributionRefunds = (props) => {
  const { myPendingContributionRefunds, dispatch, exchange, account } = props

  return(
    <tbody>
      { myPendingContributionRefunds.map((contribution) => {
        return (
          <OverlayTrigger
            key={contribution.id}
            placement='auto'
            overlay={projectInfo(contribution.project)}
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
}

const showMyReleasedContributions = (props) => {
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
              <button
                  className="btn btn-primary btn-block btn-sm"
                  name={myProject.id}
                  onClick={(event) => {
                    console.log(event.target.name)
                    refundContributions(this.props.dispatch, this.props.web3, this.props.account, event.target.name, this.props.crowdfunder)
                  }}
                >
                  Transfer
              </button>
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Supporter #</th>
                    <th>Time</th>
                  </tr>
                </thead>
                { this.props.showMyPendingContributionRefunds ? showMyContributionRefunds(this.props) : <Spinner type="table" />}
              </table>
            </Tab>
            <Tab eventKey="held" title="Held">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Supporter #</th>
                    <th>Time Left</th>
                  </tr>
                </thead>
                { this.props.showMyHeldContributions ? showMyHeldContributions(this.props) : <Spinner type="table" />}
              </table>
            </Tab>
            <Tab eventKey="released" title="Released">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Supporter #</th>
                    <th>Time</th>
                  </tr>
                </thead>
                { this.props.showMyReleasedContributions ? showMyReleasedContributions(this.props) : <Spinner type="table" />}
              </table>
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const formattedContributionsLoadedSelector = formattedContributionsLoadedSelector(state)
  const contributionRefunding = contributionRefundingSelector(state)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    account: accountSelector(state),
    myPendingContributionRefunds = myPendingContributionRefundsSelector(state)
  }
}

export default connect(mapStateToProps)(MyContributions);

