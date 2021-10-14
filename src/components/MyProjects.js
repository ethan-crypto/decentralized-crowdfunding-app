import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import { 
  crowdfunderSelector,
  daiSelector,
  accountSelector,
  web3Selector,
  myPendingTransfersSelector,
  myOpenProjectsSelector,
  myClosedProjectsSelector,
  formattedProjectsLoadedSelector,
  projectFundsTransferingSelector,
  projectCancellingSelector,
  feePercentSelector
} from '../store/selectors'
import { 
  cancelProject,
  transferAllProjectFunds,
  loadFeePercent
} from '../store/interactions'

const showTransferInfo = (pendingTransfers, props) => {
  return(
    <>
      <button 
        className="btn btn-primary btn-sm btn-block"
        onClick={(e) => {
          transferAllProjectFunds(props.dispatch, props.web3, props.account, props.myPendingTransferProjects, props.crowdfunder)
        }}
      >
        Transfer All
      </button>
      <div>
        <small>Fee: ${pendingTransfers.totalPendingTransferFee} </small>
      </div>
      <div>
        <small>Total: ${pendingTransfers.totalPendingTransferFunds} </small>
      </div>
    </>
  )
}

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
  const {
    myPendingTransferProjects,
    myOpenProjects,
    myClosedProjects,
    showTransferTotal, 
    showTransferInfo,
    feePercent
  } = props
  return (
    <Tabs defaultActiveKey="pendingTransferProjects" className="bg-dark text-white">
      <Tab eventKey="pendingTransferProjects" title="Pending Transfer" className="bg-dark">
         { showTransferInfo ? showTransferInfo(myPendingTransfers, props) : null }
        { myPendingTransfers.projects.map((project, key) => renderMyProject(project, props, key) )}  
      </Tab>
      <Tab eventKey="openProjects" title="Open" className="bg-dark">
        { myOpenProjects.map((project, key) => renderMyProject(project, props, key) )}   
      </Tab>
      <Tab eventKey="closedProjects" title="Closed" className="bg-dark">
        { myClosedProjects.map((project, key) => renderMyProject(project, props, key) )}  
      </Tab>
    </Tabs>
  )
}

class MyProjects extends Component {
  componentDidMount(){
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const { dispatch, web3, crowdfunder, account } = this.props
    await loadFeePercent(dispatch, web3, crowdfunder, account)
  }

  render() {
    console.log(this.props.myPendingTransferProjects)
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
  const formattedProjectsLoaded = formattedProjectsLoadedSelector(state)
  const projectFundsTransfering = projectFundsTransferingSelector(state)
  const projectCancelling = projectCancellingSelector(state)
  const myPendingTransfers = myPendingTransfersSelector(state)
  const feePercent = feePercentSelector(state)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    dai: daiSelector(state),
    account: accountSelector(state),
    myPendingTransfers,
    myOpenProjects: myOpenProjectsSelector(state),
    myClosedProjects: myClosedProjectsSelector(state),
    showMyProjects: formattedProjectsLoaded && !projectFundsTransfering && !projectCancelling,
    feePercent,
    showTransferInfo: myPendingTransferProjects.length > 0 && feePercent
  }
}

export default connect(mapStateToProps)(MyProjects)