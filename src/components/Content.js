import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ProgressBar, OverlayTrigger, Tooltip, Popover } from 'react-bootstrap'
import Discover from './Discover'
import MyProjects from './MyProjects'
import MyContributions from './MyContributions'
import Transactions from './Transactions'
import { 
  crowdfunderSelector,
  daiSelector,
  accountSelector,
  web3Selector,
  deploymentSelector
 } from '../store/selectors'
import { 
  loadAllCrowdfunderData, 
  subscribeToEvents,
} from '../store/interactions'

const renderProjectPopover = project => {
  return(
    <Popover id="popover-positioned-auto">
      <Popover.Header >
        <small className="text-muted">{project.creator}</small>
      </Popover.Header>
      <ul id="imageList" className="list-group list-group-flush">
        {renderContent(project)}
      </ul>
    </Popover>
  )
}

const renderRefundProgressBar = refunds => {
  
  return(
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip>
          <strong>{refunds.percentRefunded}%</strong> refunded
        </Tooltip>
      }
    >
      <ProgressBar now = {refunds.percentRefunded} variant ="dark"  />
    </OverlayTrigger>
  )
}

const renderRefundInfo = refunds => {
  return (
    <tr>
      <td className= "small float-right">REFUNDS: </td>
      <td className= "small float-left mt-1 text-muted">
        {refunds.formattedTotalRefundAmount > 0 ? `$${refunds.formattedTotalRefundAmount} refunded across ${refunds.numberOfRefunds} supporter${ refunds.numberOfRefunds !== 1 ? 's' : ''}` :
        'None' } 
      </td>
    </tr>
  )
}

const renderContent = (project) => {
  const projectRefundable = project.formattedRaisedFunds > 0 && project.refunds !== undefined
  return(
    <>
      <li className="list-group-item">
        <p className="text-center"><img src={`https://ipfs.infura.io/ipfs/${project.imgHash}`} alt={project.imgHash} className= 'mw-100' /></p>
        <p>{project.name}</p>
        <small className="float-left mt-1 text-muted"> {project.description} </small>
      </li>
      <li key={project.id} className="list-group-item py-2">
        <div className= "py-2">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip>
                <strong>{project.percentFunded}%</strong> funded
              </Tooltip>
            }
          >
            <ProgressBar now = {project.percentFunded} variant ={project.projectTypeClass}  />
          </OverlayTrigger>
          { projectRefundable ? renderRefundProgressBar(project.refunds) : null}
        </div>
        <table className="table table-dark table-sm small mb-sm-2">
          <tbody>
            <tr>
              <td className= "small float-right">GOAL: </td>
              <td className= "small float-left mt-1 text-muted">Raise ${project.formattedFundGoal} in {project.durationInDays} days</td>
            </tr>
            <tr>
              <td className= "small float-right">PROGRESS: </td>
              <td className= "small float-left mt-1 text-muted">{project.formattedRaisedFunds > 0 ? 
                `$${project.formattedRaisedFunds} contributed across ${ project.supporterCount } supporter${ +project.supporterCount !== 1 ? 's' : ''}` : 
                'None' }
              </td>
            </tr>
            <tr>
              <td className= "small float-right">{project.status === "OPEN" ? "TIME LEFT: " : project.status === "CANCELLED" ? "CANCELLED: " : "ENDED: "}</td>
              <td className= "small float-left mt-1 text-muted">{project.status === "OPEN" ? project.timeLeft : project.status === "CANCELLED" ? project.cancelledDate : project.endDate }</td>
            </tr>
            { projectRefundable ? renderRefundInfo(project.refunds) : null}
          </tbody>
        </table>
      </li>
    </>
  )
}



class Content extends Component {
  componentWillMount() {
    this.loadBlockchainData(this.props)
  }
  async loadBlockchainData(props) {
    const { dispatch, crowdfunder, deployment, dai, account } = props
    await loadAllCrowdfunderData(crowdfunder, deployment, dispatch)
    await subscribeToEvents(crowdfunder, dai, account, dispatch)
  }

  render() {
    return (
      <div className="content">
        <Discover
          renderContent ={renderContent}
        />
        <div className="vertical-split">
          <MyContributions
            renderProjectPopover ={renderProjectPopover}
          />
          <Transactions
            renderProjectPopover ={renderProjectPopover}
          />
        </div>
          <MyProjects 
            renderContent ={renderContent}
          />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    crowdfunder: crowdfunderSelector(state),
    dai: daiSelector(state),
    account: accountSelector(state),
    web3: web3Selector(state),
    deployment: deploymentSelector(state)
  }
}

export default connect(mapStateToProps)(Content)