import React, { Component } from 'react'
import { connect } from 'react-redux'
import CreateProject from './CreateProject'
import OpenProjects from './OpenProjects'
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


const renderFundingInfo = project => {
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
        <OpenProjects
          renderContent ={renderContent}
          renderProgressBar ={renderProgressBar}
          renderFundingInfo ={renderFundingInfo}
        />
        <MyProjects 
          renderContent ={renderContent}
          renderProgressBar ={renderProgressBar}
          renderFundingInfo ={renderFundingInfo}
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