import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import OpenProjects from './OpenProjects'
import MyProjects from './MyProjects'
import ProgressBar from "@ramonak/react-progress-bar";
import { 
  crowdfunderSelector,
  projectsLoadedSelector,
  accountSelector,
  contributionSelector,
  web3Selector,
  allRefundsLoadedSelector
} from '../store/selectors'
import { 
  loadAllRefunds
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



class Feed extends Component {
  componentDidMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    await loadAllRefunds(this.props.crowdfunder, this.props.dispatch)
  }

  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          Feed
        </div>
        <div className="card-body">
          <Tabs defaultActiveKey="openProjects" className="bg-dark text-white">
            <Tab eventKey="openProjects" title="Open Projects " className="bg-dark">
              { this.props.showOpenProjects ? 
                <OpenProjects
                  renderContent ={renderContent}
                  renderProgressBar ={renderProgressBar}
                  renderFundingInfo ={renderFundingInfo}
                /> 
               : <Spinner />}
            </Tab>
            <Tab eventKey="myProjects" title="My Projects " className="bg-dark">
              { this.props.showMyProjects ? 
                <MyProjects 
                  renderContent ={renderContent}
                  renderProgressBar ={renderProgressBar}
                  renderFundingInfo ={renderFundingInfo}
                />
                : <Spinner />}
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const projectsLoaded = projectsLoadedSelector(state)
  const allRefundsLoaded = allRefundsLoadedSelector(state)
  const contribution = contributionSelector(state)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    account: accountSelector(state),
    showOpenProjects: projectsLoaded && !contribution.loading,
    showMyProjects: projectsLoaded && allRefundsLoaded
  }
}

export default connect(mapStateToProps)(Feed)