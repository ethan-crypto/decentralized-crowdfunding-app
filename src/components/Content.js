import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ProgressBar, OverlayTrigger, Tooltip, Popover, PopoverHeader } from 'react-bootstrap'
import CreateProject from './CreateProject'
import Discover from './Discover'
import MyProjects from './MyProjects'
import MyContributions from './MyContributions'
import { 
  crowdfunderSelector,
 } from '../store/selectors'
import { 
  loadAllProjects, 
  loadAllRefunds,
  subscribeToEvents,
  loadAllContributions
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

const renderContent = project => {
  return(
    <>
      <li className="list-group-item">
        <p className="text-center"><img src={`https://ipfs.infura.io/ipfs/${project.imgHash}`} style={{ maxWidth: '420px'}}/></p>
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
          {project.refunds !== undefined ? renderRefundProgressBar(project.refunds) : null}
        </div>
        <table className="table table-dark table-sm small mb-sm-2">
          <tbody>
            <tr>
              <td className= "small float-right">GOAL: </td>
              <td className= "small float-left mt-1 text-muted">Raise ${project.formattedFundGoal} in {project.timeGoalInDays} days</td>
            </tr>
            <tr>
              <td className= "small float-right">PROGRESS: </td>
              <td className= "small float-left mt-1 text-muted">{project.formattedTotalFunds > 0 ? 
                `$${project.formattedTotalFunds} contributed across ${ project.supporterCount } supporter${ +project.supporterCount !== 1 ? 's' : ''}` : 
                'None' }
              </td>
            </tr>
            <tr>
              <td className= "small float-right">{project.status !== "OPEN" ? "ENDED: " : "TIME LEFT: "}</td>
              <td className= "small float-left mt-1 text-muted">{project.status !== "OPEN" ? project.endDate : project.timeLeft}</td>
            </tr>
            {project.formattedTotalFunds > 0 && project.refunds !== undefined ? renderRefundInfo(project.refunds) : null}
          </tbody>
        </table>
      </li>
    </>
  )
}



class Content extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props)
  }
  async loadBlockchainData(props) {
    const { dispatch, crowdfunder } = props
    await loadAllProjects(crowdfunder, dispatch)
    await loadAllRefunds(crowdfunder, dispatch)
    await loadAllContributions(crowdfunder, dispatch)
    await subscribeToEvents(crowdfunder, dispatch)
  }

  render() {
    return (
      <div className="content">
        <Discover
          renderContent ={renderContent}
        />
        <MyContributions
          renderProjectPopover ={renderProjectPopover}
        />
        <div className="vertical-split">
          <MyProjects 
            renderContent ={renderContent}
          />
          <CreateProject />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    crowdfunder: crowdfunderSelector(state),
  }
}

export default connect(mapStateToProps)(Content)