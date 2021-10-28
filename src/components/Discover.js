import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import { 
  crowdfunderSelector,
  daiSelector,
  discoverProjectsSelector,
  accountSelector,
  contributionSelector,
  web3Selector,
  formattedProjectsLoadedSelector
} from '../store/selectors'
import { 
  contributeToProject,
} from '../store/interactions'
import {
  contributionAmountChanged
} from '../store/actions'



class Discover extends Component {
  render() {
    const {
      dispatch,
      web3,
      contribution,
      account,
      crowdfunder,
      dai,
      renderContent,
      discoverProjects
    } = this.props
    return(
      <div className="card bg-dark text-white">
        <div className="card-header">
          Discover
        </div>
        <div className="card-body">
        { this.props.showOpenProjects ? 
          discoverProjects.map((project) => {
          return(
            <div className ="card mb-4" key={project.id} >
              <div className="card-header">
                <small className="text-muted">{project.creator}</small>
              </div>
              <ul id="imageList" className="list-group list-group-flush">
                {renderContent(project)}
                <li key={project.id} className="list-group-item py-2"> 
                  <form className="row"  
                    onSubmit={(event) => {
                      event.preventDefault()
                      contributeToProject(dispatch, web3, contribution.amount, account, project.id, crowdfunder, dai)
                    }}
                    onBlur={(event) => {
                      event.preventDefault()
                      if (!event.currentTarget.contains(event.relatedTarget)) {
                        document.getElementById(project.id).value = ''
                    }}}
                    >
                    <div className="col-sm pe-sm-0 mb-sm-auto py-2">
                      <input
                        type="text"
                        placeholder="Dai Amount"
                        id = {project.id}
                        value = { contribution.id !== project.id ? '' : contribution.amount}
                        onChange={(e) => dispatch( contributionAmountChanged(e.target.value, project.id))}
                        className="form-control form-control-sm bg-dark text-white"
                        required />
                    </div>
                    <div className="col-sm-auto ps-sm-0 mb-sm-auto py-2">  
                      <button type="submit" className="btn btn-primary btn-block btn-sm">Contribute</button>
                    </div>
                  </form>
                </li>
              </ul>
            </div>
          )})
          : <Spinner />}
        </div> 
      </div>
    )  
  }
}

function mapStateToProps(state) {
  const contribution = contributionSelector(state)
  const formattedProjectsLoaded = formattedProjectsLoadedSelector(state)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    dai: daiSelector(state),
    account: accountSelector(state),
    discoverProjects: discoverProjectsSelector(state),
    contribution,
    showOpenProjects: formattedProjectsLoaded && !contribution.loading
  }
}

export default connect(mapStateToProps)(Discover)
