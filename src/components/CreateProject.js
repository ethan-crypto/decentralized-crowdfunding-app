import React, { Component } from 'react'
import { connect } from 'react-redux'
import { 
  crowdfunderSelector,
  projectMakingSelector,
  accountSelector,
  web3Selector,
  bufferSelector
 } from '../store/selectors'
import { makeProject } from '../store/interactions'
import Spinner from './Spinner'
import CreateProjectForm from './CreateProjectForm'


class CreateProject extends Component {

  render() {
    const {web3, account, crowdfunder, dispatch, buffer} = this.props
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          Create Project
        </div>
        <div className="card-body">
          {this.props.showForm ? 
            <CreateProjectForm 
              dispatch={dispatch}
              onSubmit= { 
              (project) => { makeProject(dispatch, web3, project, buffer, account, crowdfunder) }
              } 
             />
           : <Spinner /> }
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const projectMaking = projectMakingSelector(state)
  return {
    web3: web3Selector(state),
    account: accountSelector(state),
    crowdfunder: crowdfunderSelector(state),
    showForm: !projectMaking,
    buffer: bufferSelector(state)
  }
}


export default connect(mapStateToProps)(CreateProject)
