import React, { Component } from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import {
  crowdfunderSelector,
  accountSelector,
  web3Selector,
  myRefundableContributionsSelector,
  myHeldContributionsSelector,
  myReleasedContributionsSelector,
  formattedContributionsLoadedSelector,
  contributionRefundingSelector
} from '../store/selectors'
import { refundContribution } from '../store/interactions'



const renderMyRefundableContributions = (props) => {
  return (
    <table className="table table-dark table-sm small">
      <thead>
        <tr>
          <th>Project</th>
          <th>Amount</th>
          <th>Time</th>
          <th>Claim</th>
        </tr>
      </thead>
      <tbody>
        {props.myRefundableContributions.map((contribution, key) => {
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
                overlay={props.renderProjectPopover(contribution.project)}
              >
                <td className={`contributions-project text-${contribution.project.projectTypeClass}`}>{contribution.project.name}</td>
              </OverlayTrigger>
              <td>${contribution.formattedFundAmount}</td>
              <td className="text-muted">{contribution.formattedTimestamp}</td>
              <td className="contributions-claimRefund"
                onClick={(e) => refundContribution(props.dispatch, props.web3, props.account, contribution.id, props.crowdfunder)}
              >
                X
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>

  )
}

const renderMyContributions = (contributions, popover) => {
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

const showMyContributions = props => {
  return (
    <Tabs defaultActiveKey="pendingRefund" className="bg-dark text-white">
      <Tab eventKey="pendingRefund" title="Pending Refund" className="bg-dark">
        {renderMyRefundableContributions(props)}
      </Tab>
      <Tab eventKey="held" title="Held" className="">
        {renderMyContributions(props.myHeldContributions, props.renderProjectPopover)}
      </Tab>
      <Tab eventKey="released" title="Released" className="">
        {renderMyContributions(props.myReleasedContributions, props.renderProjectPopover)}
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
          {this.props.showMyContributions ? showMyContributions(this.props) : <Spinner />}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const formattedContributionsLoaded = formattedContributionsLoadedSelector(state)
  const contributionRefunding = contributionRefundingSelector(state)
  const myRefundableContributions = myRefundableContributionsSelector(state)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    account: accountSelector(state),
    myRefundableContributions,
    myHeldContributions: myHeldContributionsSelector(state),
    myReleasedContributions: myReleasedContributionsSelector(state),
    showMyContributions: !contributionRefunding && formattedContributionsLoaded,
  }
}

export default connect(mapStateToProps)(MyContributions);

