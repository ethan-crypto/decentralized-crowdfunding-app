import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import { 
  crowdfunderSelector,
  daiSelector,
  accountSelector,
  web3Selector,
  myProjectsSelector,
  projectsLoadedSelector,
  allRefundsLoadedSelector, 
  projectFundsTransferingSelector,
  projectCancellingSelector
} from '../store/selectors'
import { 
  cancelProject,
  transferAllProjectFunds
} from '../store/interactions'

const renderRefundInfo = myProject => {
  return (
    <tr>
      <td className= "small float-right">REFUNDS: </td>
      <td className= "small float-left mt-1 text-muted">
        {myProject.totalRefundAmount > 0 ? `$${myProject.totalRefundAmount} refunded across ${myProject.numberOfRefunds} supporter${ myProject.numberOfRefunds !== 1 ? 's' : ''}
        , ${Math.round(myProject.totalRefundAmount*100/myProject.formattedTotalFunds)}% refunded`:
        'None' } 
      </td>
    </tr>
  )
}

const renderMyCancelledProject = (myProject, props, key) => {
  return (
    <div className ="card mb-4" key={key} >
      <ul id="imageList" className="list-group list-group-flush">
        {props.renderContent(myProject)}
        <li key={key} className="list-group-item py-2">
          {props.renderProgressBar(myProject, myProject.barColor)}
          <table className="table table-dark table-sm small">
            <tbody>
              {props.renderFundingInfo(myProject)}
              <tr>
                <td className= "small float-right">CANCELLED: </td>
                <td className= "small float-left mt-1 text-muted">{myProject.cancelledDate}</td>
              </tr>
              {myProject.formattedTotalFunds > 0 ? renderRefundInfo(myProject) : null}
            </tbody>
          </table>
        </li>
      </ul>
    </div>
  )
}

const renderMyOpenProject = (myProject, props, key) => {
  
  return (
    <div className ="card mb-4" key={key} >
      <ul id="imageList" className="list-group list-group-flush">
        {props.renderContent(myProject)}
        <li key={key} className="list-group-item py-2">
          {props.renderProgressBar(myProject, myProject.barColor)}
          <table className="table table-dark table-sm small">
            <tbody>
              {props.renderFundingInfo(myProject)}
              <tr>
                <td className= "small float-right">TIME LEFT: </td>
                <td className= "small float-left mt-1 text-muted">{myProject.timeLeft} to go</td>
              </tr>
            </tbody>
          </table>
          <button
            className="btn btn-link btn-sm float-right pt-0"
            name={myProject.id}
            onClick={(event) => {
              console.log(event.target.name)
              cancelProject(props.dispatch, props.web3, props.account, event.target.name, props.crowdfunder)
            }}
          >
            Cancel Project
          </button>  
        </li>
      </ul>
    </div>
  )
}

const renderMyFailedProject = (myProject, props, key) => {
  return (
    <div className ="card mb-4" key={key} >
      <ul id="imageList" className="list-group list-group-flush">
        {props.renderContent(myProject)}
        <li key={key} className="list-group-item py-2">
          {props.renderProgressBar(myProject, myProject.barColor)}
          <table className="table table-dark table-sm small">
            <tbody>
              {props.renderFundingInfo(myProject)}
              <tr>
                <td className= "small float-right">ENDED: </td>
                <td className= "small float-left mt-1 text-muted">{myProject.endDate}</td>
              </tr>
              {myProject.formattedTotalFunds > 0 ? renderRefundInfo(myProject) : null}
            </tbody>
          </table>
        </li>
      </ul>
    </div>
  )
}

const renderMySuccessfulProject = (myProject, props, key) => {
  return(
    <div className ="card mb-4" key={key} >
      <ul id="imageList" className="list-group list-group-flush">
        {props.renderContent(myProject)}
        <li key={key} className="list-group-item py-2">
          {props.renderProgressBar(myProject, myProject.barColor)}
          <table className="table table-dark table-sm small">
            <tbody>
              {props.renderFundingInfo(myProject)}
              <tr>
                <td className= "small float-right">ENDED: </td>
                <td className= "small float-left mt-1 text-muted">{myProject.endDate}</td>
              </tr>
              <tr>
                <td className= "small float-right">TRANSFERED: </td>
                <td className= "small float-left mt-1 text-muted">{myProject.transferedDate}</td>
              </tr>
            </tbody>
          </table>
        </li>
      </ul>
    </div>
  )
  
}

const renderMyPendingTransferProject = (myProject, props, key) => {
  return(
    <div className ="card mb-4" key={key} >
      <ul id="imageList" className="list-group list-group-flush">
        {props.renderContent(myProject)}
        <li key={key} className="list-group-item py-2">
          {props.renderProgressBar(myProject, myProject.barColor)}
          <table className="table table-dark table-sm small">
            <tbody>
              {props.renderFundingInfo(myProject)}
              <tr>
                <td className= "small float-right">ENDED: </td>
                <td className= "small float-left mt-1 text-muted">{myProject.endDate}</td>
              </tr>
            </tbody>
          </table>
          <button
              className="btn btn-link btn-sm float-right pt-0"
              name={myProject.id}
              onClick={(event) => {
                console.log(event.target.name)
                transferAllProjectFunds(props.dispatch, props.web3, props.account, event.target.name, props.crowdfunder)
              }}
            >
              Transfer
          </button>
        </li>
      </ul>
    </div>
  )
  
}

const showMyProjects = props => {
  const {
    myProjects
  } = props
  return (
    <Tabs defaultActiveKey="pendingTransferProjects" className="bg-dark text-white">
      <Tab eventKey="pendingTransferProjects" title="Pending Transfer" className="bg-dark">
        { myProjects.pendingTransferProjects.map((myProject, key) => renderMyPendingTransferProject(myProject, props, key) )}  
      </Tab>
      <Tab eventKey="openProjects" title="Open" className="bg-dark">
        { myProjects.openProjects.map((myProject, key) => renderMyOpenProject(myProject, props, key) )}   
      </Tab>
      <Tab eventKey="cancelledProjects" title="Cancelled" className="bg-dark">
        { myProjects.cancelledProjects.map((myProject, key) => renderMyCancelledProject(myProject, props, key) )}  
      </Tab>
      <Tab eventKey="failedProjects" title="Failed" className="bg-dark">
        { myProjects.failedProjects.map((myProject, key) => renderMyFailedProject(myProject, props, key) )}  
      </Tab>
      <Tab eventKey="successfulProjects" title="Successful" className="bg-dark">
        { myProjects.successfulProjects.map((myProject, key) => renderMySuccessfulProject(myProject, props, key) )}  
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
  const projectsLoaded = projectsLoadedSelector(state)
  const allRefundsLoaded = allRefundsLoadedSelector(state)
  const projectFundsTransfering = projectFundsTransferingSelector(state)
  const projectCancelling = projectCancellingSelector(state)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    dai: daiSelector(state),
    account: accountSelector(state),
    myProjects: myProjectsSelector(state),
    showMyProjects: projectsLoaded && allRefundsLoaded && !projectFundsTransfering && !projectCancelling
  }
}

export default connect(mapStateToProps)(MyProjects)