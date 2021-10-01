import React, { Component } from 'react'
import { connect } from 'react-redux'
import { 
  crowdfunderSelector,
  daiSelector,
  accountSelector,
  web3Selector,
  myProjectsSelector
} from '../store/selectors'
import { 
  cancelProject,
  transferProjectFunds
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

const renderMyCancelledProject = (myProject, props) => {
  return (
    <>
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
    </>
  )
}

const renderMyOpenProject = (myProject, props) => {
  
  return (
    <>
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
    </>
  )
}

const renderMyFailedProject = (myProject, props) => {
  return (
    <>
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
    </>
  )
}

const renderMySuccessfulProject = (myProject, props) => {
  return(
    <>
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
    </>
  )
  
}

const renderMyPendingTransferProject = (myProject, props) => {
  return(
    <>
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
      return (renderMyCancelledProject(myProject, props))
    case "OPEN":
      return (renderMyOpenProject(myProject, props))
    case "FAILED":
      return (renderMyFailedProject(myProject, props))
    case "SUCCEEDED":
      return (renderMySuccessfulProject(myProject, props))
    case "PENDING_TRANSFER":
      return (renderMyPendingTransferProject(myProject, props))
    default:
      return null
  }
}

class MyProjects extends Component {
  render() {
    return (
      <div>
        { this.props.myProjects.map((myProject, key) => {
          return(
            <div className ="card mb-4" key={key} >
              <div className="card-header" style={{backgroundColor: myProject.backgroundColor}}>
                <small className="text-muted">Status: {myProject.status}</small>
              </div>
              <ul id="imageList" className="list-group list-group-flush">
                {this.props.renderContent(myProject)}
                <li key={key} className="list-group-item py-2">
                  {this.props.renderProgressBar(myProject, myProject.barColor)}
                  {renderMyProjectState(myProject, this.props)}  
                </li>
              </ul>
            </div>
          )})
        }
      </div>
    )
  }
}



function mapStateToProps(state) {
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    dai: daiSelector(state),
    account: accountSelector(state),
    myProjects: myProjectsSelector(state),
  }
}

export default connect(mapStateToProps)(MyProjects)