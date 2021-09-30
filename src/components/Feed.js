import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab, Tooltip } from 'react-bootstrap'
import Spinner from './Spinner'
import ProgressBar from "@ramonak/react-progress-bar";
import { 
  crowdfunderSelector,
  daiSelector,
  openProjectsSelector,
  projectsLoadedSelector,
  accountSelector,
  contributionSelector,
  web3Selector,
  myProjectsSelector,
  allRefundsLoadedSelector,
  allRefundsSelector
} from '../store/selectors'
import { 
  contributeToProject,
  cancelProject,
  loadAllRefunds,
  transferProjectFunds
} from '../store/interactions'
import {
  contributionAmountChanged
} from '../store/actions'

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
  if(project.formattedTotalFunds > 0) {

  }
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

const renderMyCancelledProject = myProject => {
  return (
    <>
      <table className="table table-dark table-sm small">
        <tbody>
          {renderFundingInfo(myProject)}
          <tr>
            <td className= "small float-right">CANCELLED: </td>
            <td className= "small float-left mt-1 text-muted">{myProject.cancelledDate}</td>
          </tr>
          {myProject.formattedTotalFunds > 0 ? renderRefundInfo(myProject) : null}
        </tbody>
      </table>
    </>
  )
}

const renderMyOpenProject = (myProject, props) => {
  
  return (
    <>
      <table className="table table-dark table-sm small">
        <tbody>
          {renderFundingInfo(myProject)}
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
    </>
  )
}

const renderMyFailedProject = myProject => {
  return (
    <>
      <table className="table table-dark table-sm small">
        <tbody>
          {renderFundingInfo(myProject)}
          <tr>
            <td className= "small float-right">ENDED: </td>
            <td className= "small float-left mt-1 text-muted">{myProject.endDate}</td>
          </tr>
          {myProject.formattedTotalFunds > 0 ? renderRefundInfo(myProject) : null}
        </tbody>
      </table>
    </>
  )
}

const renderMySuccessfulProject = myProject => {
  return(
    <>
      <table className="table table-dark table-sm small">
        <tbody>
          {renderFundingInfo(myProject)}
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
    </>
  )
  
}

const renderMyPendingTransferProject = (myProject, props) => {
  return(
    <>
      <table className="table table-dark table-sm small">
        <tbody>
          {renderFundingInfo(myProject)}
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
            transferProjectFunds(props.dispatch, props.web3, props.account, event.target.name, props.crowdfunder)
          }}
        >
          Transfer
      </button>
    </>
  )
  
}

const renderMyProjectState = (myProject, props) => {
  switch(myProject.status){
    case "CANCELLED":
      return (renderMyCancelledProject(myProject))
        break;
    case "OPEN":
      return (renderMyOpenProject(myProject, props))
        break;
    case "FAILED":
      return (renderMyFailedProject(myProject))
        break;
    case "SUCCEEDED":
      return (renderMySuccessfulProject(myProject))
        break;
    case "PENDING_TRANSFER":
      return (renderMyPendingTransferProject(myProject, props))
        break;
  }
}

const renderMyProject = (myProject, key, props) => {

  return (
    <div className ="card mb-4" key={key} >
      <div className="card-header" style={{backgroundColor: myProject.backgroundColor}}>
        <small className="text-muted">Status: {myProject.status}</small>
      </div>
      <ul id="imageList" className="list-group list-group-flush">
        {renderContent(myProject)}
        <li key={key} className="list-group-item py-2">
          {renderProgressBar(myProject, myProject.barColor)}
          {renderMyProjectState(myProject, props)}  
        </li>
      </ul>
    </div>
  )
}

const renderOpenProject = (openProject, key, props) => {
  const {
    dispatch,
    web3,
    contributionAmount,
    account,
    crowdfunder,
    dai
  } = props 

  return (
    <div className ="card mb-4" key={key} >
      <div className="card-header">
        <small className="text-muted">{openProject.creator}</small>
      </div>
      <ul id="imageList" className="list-group list-group-flush">
        {renderContent(openProject)}
        <li key={key} className="list-group-item py-2">
          {renderProgressBar(openProject, "#0075ff")}
          <table className="table table-dark table-sm small">
            <tbody>
              {renderFundingInfo(openProject)}
              <tr>
                <td className= "small float-right">TIME LEFT: </td>
                <td className= "small float-left mt-1 text-muted">{openProject.timeLeft} to go</td>
              </tr>
            </tbody>
          </table>
          <form className="row" onSubmit={(event) => {
            event.preventDefault()
            contributeToProject(dispatch, web3, contributionAmount, account, openProject.id, crowdfunder, dai)
          }}>
            <div className="col-12 col-sm pr-sm-2">
              <input
                type="text"
                placeholder="Dai Amount"
                onChange={(e) => dispatch( contributionAmountChanged(e.target.value))}
                className="form-control form-control-sm bg-dark text-white"
                required />
            </div>
            <div className="col-12 col-sm-auto pl-sm-0">  
              <button type="submit" className="btn btn-primary btn-block btn-sm">Contribute</button>
            </div>
          </form>
        </li>
      </ul>
    </div>
  )
}

const showMyProjects = (props) => {
  return(
    props.myProjects.map((myProject, key) => renderMyProject(myProject, key, props))
  )
}

const showOpenProjects = (props) => {
  return(
    props.openProjects.map((openProject, key) => renderOpenProject(openProject, key, props))
  )
}

class Feed extends Component {
  componentDidMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const { dispatch, web3, crowdfunder, account } = this.props
    await loadAllRefunds(crowdfunder, dispatch)
  }

  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-body">
          <Tabs defaultActiveKey="openProjects" className="bg-dark text-white">
            <Tab eventKey="openProjects" title="Open Projects " className="bg-dark">
              { this.props.showOpenProjects ? showOpenProjects(this.props) : <Spinner />}
            </Tab>
            <Tab eventKey="myProjects" title="My Projects " className="bg-dark">
              { this.props.showMyProjects ? showMyProjects(this.props) : <Spinner />}
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const projectsLoaded = projectsLoadedSelector(state)
  const contribution = contributionSelector(state)
  const allRefundsLoaded = allRefundsLoadedSelector(state)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    dai: daiSelector(state),
    account: accountSelector(state),
    openProjects: openProjectsSelector(state),
    myProjects: myProjectsSelector(state),
    showOpenProjects: projectsLoaded && !contribution.loading,
    showMyProjects: projectsLoaded && allRefundsLoaded,
    contributionAmount: contribution.amount
  }
}

export default connect(mapStateToProps)(Feed)