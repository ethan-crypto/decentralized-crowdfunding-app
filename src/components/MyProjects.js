import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Nav, NavDropdown } from 'react-bootstrap'
import Spinner from './Spinner'
import { 
  crowdfunderSelector,
  daiSelector,
  accountSelector,
  web3Selector,
  myProjectsSelector,
  myPendingDisbursementsSelector,
  myOpenProjectsSelector,
  myClosedProjectsSelector,
  formattedProjectsLoadedSelector,
  projectFundsTransferingSelector,
  projectCancellingSelector,
  feePercentSelector,
  projectMakingSelector,
  bufferSelector
} from '../store/selectors'
import { 
  cancelProject,
  disburseProjectFunds,
  loadFeePercent,
  makeProject
} from '../store/interactions'
import NewProject from './NewProject'


const renderButton = (project, props) => {
  const isOpen = project.status === "OPEN"
  return(
    <li key={project.id} className="list-group-item py-2"> 
      <button
        className="btn btn-link btn-sm float-right pt-0"
        name={project.id}
        onClick={(event) => {
          isOpen
          ? cancelProject(props.dispatch, props.web3, props.account, event.target.name, props.crowdfunder)
          : disburseProjectFunds(props.dispatch, props.web3, props.account, event.target.name, props.crowdfunder) 
        }}
      >
        {isOpen ? "Cancel Project" : "Disburse Project Funds" }
      </button> 
    </li>
  )  
}


const renderMyProjects = (props, projects) => {
  return (
    projects.map((project, key) => {
      return (
        <div className="card mb-4" key={key} >
          <ul id="imageList" className="list-group list-group-flush">
            {props.renderContent(project)}
            {project.status === "OPEN" || project.status === "PENDING_DISBURSEMENT" ? renderButton(project, props) : null}
          </ul>
        </div>
      )
    })
  )
}

function renderMyProjectsContent(props, selectedKey) {
  const {
    dispatch,
    web3,
    buffer,
    account,
    crowdfunder
  } = props

  switch(selectedKey) {
    case 'myProjects':
      return renderMyProjects(props, props.myProjects)
    case 'myPendingDisbursements':
      return renderMyProjects(props, props.myPendingDisbursements)
    case 'myOpenProjects':
      return renderMyProjects(props, props.myOpenProjects)
    case 'myClosedProjects':
      return renderMyProjects(props, props.myClosedProjects)
    case 'New':
      return (
        <NewProject 
          dispatch={dispatch}
          onSubmit= { 
          (project) => { makeProject(dispatch, web3, project, buffer, account, crowdfunder) }
          } 
         />)
    default:
      return renderMyProjects(props, props.myProjects)
  }
}



class MyProjects extends Component {
  componentDidMount() {
    this.loadBlockchainData()
  }
  constructor(props) {
    super(props)
    this.state = {
      navSelection: 'myProjects'
    }
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
          {this.props.showNavbar
            ?
            <>
              <div>
                <Nav
                  variant="tabs"
                  defaultActiveKey="myProjects"
                  onSelect={(selectedKey) => this.setState(prevState => ({navSelection: selectedKey}))}
                >
                  <NavDropdown title="View" id="nav-dropdown">
                    <NavDropdown.Item eventKey="myProjects">All</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item eventKey="myPendingDisbursements">Pending Disbursement</NavDropdown.Item>
                    <NavDropdown.Item eventKey="myOpenProjects">Open</NavDropdown.Item>
                    <NavDropdown.Item eventKey="myClosedProjects">Closed</NavDropdown.Item>
                  </NavDropdown>
                  <Nav.Item>
                    <Nav.Link eventKey="New">New</Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>
              <div>
              {renderMyProjectsContent(this.props, this.state.navSelection)}
              </div>
            </>
            : <Spinner />}
        </div>
      </div>
    )
  }
}



function mapStateToProps(state) {
  const formattedProjectsLoaded = formattedProjectsLoadedSelector(state)
  const projectFundsTransfering = projectFundsTransferingSelector(state)
  const projectCancelling = projectCancellingSelector(state)
  const feePercent = feePercentSelector(state)
  const projectMaking = projectMakingSelector(state)
  return {
    web3: web3Selector(state),
    crowdfunder: crowdfunderSelector(state),
    dai: daiSelector(state),
    account: accountSelector(state),
    myProjects: myProjectsSelector(state),
    myPendingDisbursements: myPendingDisbursementsSelector(state),
    myOpenProjects: myOpenProjectsSelector(state),
    myClosedProjects: myClosedProjectsSelector(state),
    showNavbar: formattedProjectsLoaded && !projectFundsTransfering && !projectCancelling && !projectMaking,
    feePercent,
    buffer: bufferSelector(state)
  }
}

export default connect(mapStateToProps)(MyProjects)