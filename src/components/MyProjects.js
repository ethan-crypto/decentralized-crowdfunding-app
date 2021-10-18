import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab, OverlayTrigger, Tooltip } from 'react-bootstrap'
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

const showTransferAllButton = props => {
  const { myPendingTransfers } = props
  return(
    <>
      <OverlayTrigger
        placement='auto'
        overlay={
          <Tooltip>
            <div>
              <small>Fee: <strong>${myPendingTransfers.totalPendingTransferFee}</strong></small>
            </div>
            <div>
              <small>Total: <strong>${myPendingTransfers.totalPendingTransferFunds}</strong></small>
            </div>
          </Tooltip>
        }
      >
        <button 
          className="btn btn-primary btn-sm btn-block"
          onClick={(e) => {
            transferAllProjectFunds(props.dispatch, props.web3, props.account, myPendingTransfers.projects, props.crowdfunder)
          }}
        >
          Transfer All
        </button>
      </OverlayTrigger>
    </>
  )
}

const renderCancelButton = (id, props) => {
  return(
    <li key={id} className="list-group-item py-2"> 
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
    </li>
  )  
}

const renderMyProject = (myProject, props, key) => {
  return (
    <div className ="card mb-4" key={key} >
      <ul id="imageList" className="list-group list-group-flush">
        {props.renderContent(myProject)}
        {myProject.status === "OPEN" ? renderCancelButton(myProject.id, props) : null}
      </ul>
    </div>
  )
}

const showMyProjects = props => {
  return (
    <Tabs defaultActiveKey="pendingTransferProjects" className="bg-dark text-white">
      <Tab eventKey="pendingTransferProjects" title="Pending Transfer" className="bg-dark">
         { props.showTransferAllButton ? showTransferAllButton(props) : null }
        { props.myPendingTransfers.projects.map((project, key) => renderMyProject(project, props, key) )}  
      </Tab>
      <Tab eventKey="openProjects" title="Open" className="bg-dark">
        { props.myOpenProjects.map((project, key) => renderMyProject(project, props, key) )}   
      </Tab>
      <Tab eventKey="closedProjects" title="Closed" className="bg-dark">
        { props.myClosedProjects.map((project, key) => renderMyProject(project, props, key) )}  
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
    showTransferAllButton: myPendingTransfers.totalPendingTransferFunds > 0 && feePercent
  }
}

export default connect(mapStateToProps)(MyProjects)