import React, { Component } from 'react'
import { connect } from 'react-redux'
import { 
  crowdfunderSelector,
  daiSelector,
  openProjectsSelector,
  accountSelector,
  contributionSelector,
  web3Selector
} from '../store/selectors'
import { 
  contributeToProject,
} from '../store/interactions'
import {
  contributionAmountChanged
} from '../store/actions'

class OpenProjects extends Component {
  render() {
    const {
      dispatch,
      web3,
      contributionAmount,
      account,
      crowdfunder,
      dai,
      renderContent,
      renderProgressBar,
      renderFundingInfo,
      openProjects
    } = this.props 

    return(
      <div>
        { openProjects.map((openProject, key) => {
          return(
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
          )})
        } 
      </div>
    )  
  }
}

function mapStateToProps(state) {
  const contribution = contributionSelector(state)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    dai: daiSelector(state),
    account: accountSelector(state),
    openProjects: openProjectsSelector(state),
    contributionAmount: contribution.amount
  }
}

export default connect(mapStateToProps)(OpenProjects)
