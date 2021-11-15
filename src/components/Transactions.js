import React, { Component } from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import {
  crowdfunderSelector,
  accountSelector,
  web3Selector,
  transactionsLoadedSelector,
  disbursementsSelector,
  contributionsSelector,
  refundsSelector
} from '../store/selectors'

const renderRefunds = (refunds, popover) => {
  return (
    <table className="table table-dark table-sm small">
      <thead>
        <tr>
          <th>Project</th>
          <th>Amount</th>
          <th>Time</th>
        </tr>
      </thead> 
      <tbody>
        { refunds.map((refund, key) => {
          return (
            <OverlayTrigger
              key={key}
              trigger = 'click'
              rootClose
              placement='left'
              overlay={popover(refund.project)}
            >
              <tr 
                key={key}
                className="refunds-refund"
              >
                <td className={`text-${refund.project.projectTypeClass}`}>{refund.project.name}</td>
                <td>${refund.formattedRefundAmount}</td>
                <td className="text-muted">{refund.formattedTimestamp}</td>
              </tr>
            </OverlayTrigger>
          )
        }) }
      </tbody>        
    </table>
  )

}

const renderContributions = (contributions, popover) => {
  return (
    <table className="table table-dark table-sm small">
      <thead>
        <tr>
          <th>Project</th>
          <th>Amount</th>
          <th>Time</th>
        </tr>
      </thead> 
      <tbody>
        { contributions.map((contribution, key) => {
          return (
            <OverlayTrigger
              key={key}
              trigger = 'click'
              rootClose
              placement='left'
              overlay={popover(contribution.project)}
            >
              <tr 
                key={key}
                className="contributions-contribution"
              >
                <td className={`text-${contribution.project.projectTypeClass}`}>{contribution.project.name}</td>
                <td>${contribution.formattedFundAmount}</td>
                <td className="text-muted">{contribution.formattedTimestamp}</td>
              </tr>
            </OverlayTrigger>
          )
        }) }
      </tbody>        
    </table>
  )
}

const renderTransfers = (projects, popover) => {
  return (
    <table className="table table-dark table-sm small">
      <thead>
        <tr>
          <th>Project</th>
          <th>Amount</th>
          <th>Fee</th>
          <th>Time</th>
        </tr>
      </thead> 
      <tbody>
        { projects.map((project) => {
          return (
            <OverlayTrigger
              key={project.id}
              trigger = 'click'
              rootClose
              placement='left'
              overlay={popover(project)}
            >
              <tr 
                key={project.id}
                className="transfers-transfer"
              >
                <td className={`text-${project.projectTypeClass}`}>{project.name}</td>
                <td>${project.transferAmount}</td>
                <td>{project.feeAmount}</td>
                <td className="text-muted">{project.transferedDate}</td>
              </tr>
            </OverlayTrigger>
          )
        }) }
      </tbody>        
    </table>

  )
}

const showTransactions = props => {
  return(
    <Tabs defaultActiveKey="transfers" className="bg-dark text-white">
      <Tab eventKey="transfers" title="Transfers">
        { renderTransfers(props.disbursements, props.renderProjectPopover)}
      </Tab>
      <Tab eventKey="contributions" title="Contributions">
        { renderContributions(props.contributions, props.renderProjectPopover)}
      </Tab>
      <Tab eventKey="refunds" title="Refunds">
        { renderRefunds(props.refunds, props.renderProjectPopover)}
      </Tab>
    </Tabs>
  )
}

class Transactions extends Component {

 render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          Transactions
        </div>
        <div className="card-body">
          { this.props.showTransactions ? showTransactions(this.props) : <Spinner />}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const transactionsLoaded = transactionsLoadedSelector(state)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    account: accountSelector(state),
    showTransactions: transactionsLoaded,
    disbursements: disbursementsSelector(state),
    contributions: contributionsSelector(state),
    refunds: refundsSelector(state)
  }
}

export default connect(mapStateToProps)(Transactions);