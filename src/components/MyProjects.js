import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import { 
  crowdfunderSelector,
  daiSelector,
  accountSelector,
  web3Selector,
  myPendingTransferProjectsSelector,
  myOpenProjectsSelector,
  myClosedProjectsSelector,
  formattedProjectsLoadedSelector,
  projectFundsTransferingSelector,
  projectCancellingSelector
} from '../store/selectors'
import { 
  cancelProject,
  transferAllProjectFunds
} from '../store/interactions'


const renderCancelButton = (id, props) => {
  return(
    <button
      className="btn btn-link btn-sm float-right pt-0"
      name={id}
      onClick={(event) => {
        console.log(event.target.name)
        cancelProject(props.dispatch, props.web3, props.account, event.target.name, props.crowdfunder)
      }}
    >
      Cancel Project
    </button> 
  )  
}

const renderMyProject = (myProject, props, key) => {
  return (
    <div className ="card mb-4" key={key} >
      <ul id="imageList" className="list-group list-group-flush">
        {props.renderContent(myProject)}
        <li key={key} className="list-group-item py-2">
          {props.renderProgressBar(myProject, myProject.barColor)}
          {props.renderDataTable(myProject)}
          {myProject.status === "OPEN" ? renderCancelButton(myProject.id, props) : null}
        </li>
      </ul>
    </div>
  )
}

const showMyProjects = props => {
  return (
    <Tabs defaultActiveKey="pendingTransferProjects" className="bg-dark text-white">
      <Tab eventKey="pendingTransferProjects" title="Pending Transfer" className="bg-dark">
        { props.myPendingTransferProjects.map((project, key) => renderMyProject(project, props, key) )}  
      </Tab>
      <Tab eventKey="openProjects" title="Open" className="bg-dark">
        { props.myOpenProjects.map((project, key) => renderMyProject(project, props, key) )}   
      </Tab>
      <Tab eventKey="closedProjects" title="Closed" className="bg-dark">
        { props.myCancelledProjects.map((project, key) => renderMyProject(project, props, key) )}  
      </Tab>
    </Tabs>
  )
}

class MyProjects extends Component {
  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          My Projects
        </div>
        <div className="card-body">
        { this.props.showMyProjects ? showMyProjects(this.props) : <Spinner />}
        </div>
      </div>
    )
  }
}



function mapStateToProps(state) {
  const formattedProjectsLoaded = projectsLoadedSelector(state)
  const projectFundsTransfering = projectFundsTransferingSelector(state)
  const projectCancelling = projectCancellingSelector(state)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    dai: daiSelector(state),
    account: accountSelector(state),
    myPendingTransferProjects: myPendingTransferProjectsSelector(state),
    myOpenProjects: myOpenProjectsSelector(state),
    myClosedProjects: myClosedProjectsSelector(state),
    showMyProjects: formattedProjectsLoaded && !projectFundsTransfering && !projectCancelling
  }
}

export default connect(mapStateToProps)(MyProjects)