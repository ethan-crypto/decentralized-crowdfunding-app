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
        {refunds.map((refund, key) => {
          return (
            <tr
              key={key}
              className="refunds-refund"
            >
              <OverlayTrigger
                key={key}
                trigger='click'
                rootClose
                placement='left'
                overlay={popover(refund.project)}
              >
                <td className={`refunds-refund text-${refund.project.projectTypeClass}`}>{refund.project.name}</td>
              </OverlayTrigger>
              <td>${refund.formattedRefundAmount}</td>
              <td className="text-muted">{refund.formattedTimestamp}</td>
            </tr>
          )
        })}
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
        {contributions.map((contribution, key) => {
          return (

            <tr
              key={key}
              className="contributions-contribution"
            >
              <OverlayTrigger
                key={key}
                trigger='click'
                rootClose
                placement='left'
                overlay={popover(contribution.project)}
              >
                <td className={`contributions-project text-${contribution.project.projectTypeClass}`}>{contribution.project.name}</td>
              </OverlayTrigger>

              <td>${contribution.formattedFundAmount}</td>
              <td className="text-muted">{contribution.formattedTimestamp}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const renderDisburesements = (projects, popover) => {
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
        {projects.map((project) => {
          return (
            <tr
              key={project.id}
              className="disburesements-disbursement"
            >
              <OverlayTrigger
                key={project.id}
                trigger='click'
                rootClose
                placement='left'
                overlay={popover(project)}
              >
                <td className={`disbursements-project text-${project.projectTypeClass}`}>{project.name}</td>
              </OverlayTrigger>
              <td>${project.disburseAmount}</td>
              <td>${project.feeAmount}</td>
              <td className="text-muted">{project.disbursedDate}</td>
            </tr>
          )
        })}
      </tbody>
    </table>

  )
}

const showTransactions = props => {
  return (
    <Tabs defaultActiveKey="disburesements" className="bg-dark text-white">
      <Tab eventKey="disburesements" title="Disburesements">
        {renderDisburesements(props.disbursements, props.renderProjectPopover)}
      </Tab>
      <Tab eventKey="contributions" title="Contributions">
        {renderContributions(props.contributions, props.renderProjectPopover)}
      </Tab>
      <Tab eventKey="refunds" title="Refunds">
        {renderRefunds(props.refunds, props.renderProjectPopover)}
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
          {this.props.showTransactions ? showTransactions(this.props) : <Spinner />}
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