import React, { Component } from 'react'
import { connect } from 'react-redux'
import Feed from './Feed'
import CreateProject from './CreateProject'
import { 
  crowdfunderSelector,
 } from '../store/selectors'
import { 
  loadAllProjects, 
  subscribeToEvents
} from '../store/interactions'



class Content extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props)
  }

  async loadBlockchainData(props) {
    const { dispatch, crowdfunder } = props
    await loadAllProjects(crowdfunder, dispatch)
    await subscribeToEvents(crowdfunder, dispatch)
  }

  render() {
    return (
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '500px' }}>
            <div className="content mr-auto ml-auto">
              <CreateProject />
              <p>&nbsp;</p>
              <Feed />
            </div>
          </main>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    crowdfunder: crowdfunderSelector(state),
  }
}

export default connect(mapStateToProps)(Content)