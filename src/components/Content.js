import React, { Component } from 'react'
import { connect } from 'react-redux'
import CreateProject from './CreateProject'
import Discover from './Discover'
import MyProjects from './MyProjects'
import ProgressBar from "@ramonak/react-progress-bar";
import { 
  crowdfunderSelector,
 } from '../store/selectors'
import { 
  loadAllProjects, 
  loadAllRefunds,
  subscribeToEvents,
  loadAllContributions
} from '../store/interactions'

const renderPopover = project => {

}

const renderRefundInfo = project => {
  return (
    <tr>
      <td className= "small float-right">REFUNDS: </td>
      <td className= "small float-left mt-1 text-muted">
        {project.totalRefundAmount > 0 ? `$${project.totalRefundAmount} refunded across ${project.numberOfRefunds} supporter${ project.numberOfRefunds !== 1 ? 's' : ''}
        , ${Math.round(project.totalRefundAmount*100/project.formattedTotalFunds)}% refunded`:
        'None' } 
      </td>
    </tr>
  )
}

const renderContent = project => {
  return(
    <li className="list-group-item">
      <p className="text-center"><img src={`https://ipfs.infura.io/ipfs/${project.imgHash}`} style={{ maxWidth: '420px'}}/></p>
      <p>{project.name}</p>
      <small className="float-left mt-1 text-muted"> {project.description} </small>
    </li>
  )
}

const renderProgressBar = (project, color) => {
  return(
    <div className= "py-2">
      <ProgressBar 
          isLabelVisible={true}
          completed={Math.round(project.formattedTotalFunds*100/project.formattedFundGoal)}
          bgColor= {color}
      />
    </div>
  )
}


const renderDataTable = project => {
  return(
    <>
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
      {project.formattedTotalFunds > 0 && (project.status === "FAILED" || project.status === "CANCELLED") ? renderRefundInfo(myProject) : null}
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
          renderProgressBar ={renderProgressBar}
          renderDataTable ={renderDataTable}
        />
        <MyProjects 
          renderContent ={renderContent}
          renderProgressBar ={renderProgressBar}
          renderDataTable ={renderDataTable}
        />
        <div className="vertical-split">
          
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