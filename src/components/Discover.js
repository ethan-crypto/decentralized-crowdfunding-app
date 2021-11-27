import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Form, Card } from 'react-bootstrap'
import Spinner from './Spinner'
import {
  crowdfunderSelector,
  daiSelector,
  discoverProjectsSelector,
  accountSelector,
  contributionSelector,
  web3Selector,
  formattedProjectsLoadedSelector,
  payWithEthSelector,
} from '../store/selectors'
import {
  contributeToProject,
} from '../store/interactions'
import {
  contributionAmountChanged,
  paymentMethodToggled
} from '../store/actions'

{/* <Card>
  <Card.Header as="h5">Featured</Card.Header>
  <Card.Body>
    <Card.Title>Special title treatment</Card.Title>
    <Card.Text>
      With supporting text below as a natural lead-in to additional content.
    </Card.Text>
    <Button variant="primary">Go somewhere</Button>
  </Card.Body>
</Card> */}
//<input type="text" value={this.state.value} onChange={this.handleChange} />
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
      discoverProjects,
      payWithEth

    } = this.props
    return (
      <Card bg="dark" className="text-white">
        <Card.Header>
          Discover
            <Form.Switch
              id="custom-switch"
              label="Pay with ETH"
              onChange = {(e) => dispatch(paymentMethodToggled(e.target.checked))}
              checked = {payWithEth}
            />
        </Card.Header>
        <div className="card-body">
          {this.props.showOpenProjects ?
            discoverProjects.map((project) => {
              return (
                <div className="card mb-4" key={project.id} >
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
                          }
                        }}
                      >
                        <div className="col-sm pe-sm-0 mb-sm-auto py-2">
                          <input
                            type="text"
                            placeholder="Dai Amount"
                            id={project.id}
                            value={contribution.id !== project.id ? '' : contribution.amount}
                            onChange={(e) => dispatch(contributionAmountChanged(e.target.value, project.id))}
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
              )
            })
            : <Spinner />}
        </div>
      </Card>
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
    payWithEth: payWithEthSelector(state),
    showOpenProjects: formattedProjectsLoaded && !contribution.loading
  }
}

export default connect(mapStateToProps)(Discover)
