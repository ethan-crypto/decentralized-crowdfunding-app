 import { combineReducers } from 'redux';
 import { reducer as formReducer } from 'redux-form'

function web3(state = {}, action) {
	switch(action.type) {
		case 'WEB3_LOADED':
			return { ...state, connection: action.connection}
		case 'WEB3_ACCOUNT_LOADED':
			return { ...state, account: action.account}
		default:
			return state
	}
}

function dai(state = {}, action) {
	switch(action.type) {
		case 'DAI_LOADED':
			return { ...state, loaded: true, contract: action.contract}
		default:
			return state
	}
}

function crowdfunder(state = {}, action) {
	let index, data
	switch(action.type) {
		case 'CROWDFUNDER_LOADED':
			return { ...state, loaded: true, contract: action.contract}
		case 'CANCELLED_PROJECTS_LOADED':
			return { ...state, cancelledProjects: { loaded: true, data: action.cancelledProjects } }
		case 'SUCCESSFUL_PROJECTS_LOADED':
			return { ...state, successfulProjects: { loaded: true, data: action.successfulProjects } }
		case 'ALL_PROJECTS_LOADED':
			return { ...state, allProjects: { loaded: true, data: action.allProjects } }
		case 'CONTRIBUTING_TO_PROJECT':
			return { ...state, contribution: { ...state.contribution, amount: null, id: null, loading: true } }
		case 'CONTRIBUTION_AMOUNT_CHANGED':
			return { ...state, contribution: { ...state.contribution, amount: action.amount, id: action.id } }
		case 'CONTRIBUTED_TO_PROJECT':
			//Prevent duplicate contributions
			index = state.allProjects.data.findIndex( 
				project => project.id === action.contribution.id &&
				+project.totalFunds + +action.contribution.fundAmount === +action.contribution.totalFunds
			)
			if(index !== -1) {
				data = state.allProjects.data
				data[index] = {
					...state.allProjects.data[index], 
					totalFunds: action.contribution.totalFunds,
					supporterCount: action.contribution.supporterCount
				}
			}
			else {
				data = state.allProjects.data
			}

			return { 
				...state, 
				allProjects: { 
					...state.allProjects,
					data				
				},
				contribution: { ...state.contribution, loading: false },
				
			}
		case 'IMAGE_FILE_CAPTURED':
			return { ...state, buffer: action.buffer }
		case 'PROJECT_MAKING':
			return {...state, projectMaking: true, buffer: null }
		case 'PROJECT_MADE':
			//Prevent duplicate projects
			index = state.allProjects.data.findIndex(project => project.id === action.project.id);

			if(index === -1) {
				data = [...state.allProjects.data, action.project]
			} else {
				data = state.allProject.data
			}

			return {
				...state,
				allProjects: {
				  ...state.allProjects,
				  data
				},
				projectMaking: false
			}
		case 'PROJECT_CANCELLING':
      		return {...state, projectCancelling: true }
      	case 'PROJECT_CANCELLED':
      		return {
		        ...state,
		        projectCancelling: false,
		        cancelledProjects: {
		          ...state.cancelledProjects, 
		          data: [
		            ...state.cancelledProjects.data,
		            action.project
		          ]
		        }
		    }
		case 'ALL_REFUNDS_LOADED':
			return { ...state, allRefunds: { loaded: true, data: action.refunds } }
		case 'PROJECT_FUNDS_TRANSFERING':
			return { ...state, projectFundsTransfering: true }
		case 'PROJECT_FUNDS_TRANSFERED':
			//Prevent duplicate succesful projects
			index = state.successfulProjects.data.findIndex(project => project.id === action.project.id);

			if(index === -1) {
				data = [...state.successfulProjects.data, action.project]
			} else {
				data = state.successfulProjects.data
			}

			return {
				...state,
				successfulProjects: {
				  ...state.successfulProjects,
				  data
				},
				projectFundsTransfering: false
			}
		case 'ALL_CONTRIBUTIONS_LOADED':
			return {...state, allContributions: { loaded: true, data: action.contributions }}
		case 'CONTRIBUTION_REFUNDING':
			return {...state, contributionRefunding: true}
		case 'CONTRIBUTION_REFUNDED':
			//Prevent duplicate refunds
			index = state.allRefunds.data.findIndex(refund => refund.id === action.refund.id);

			if(index === -1) {
				data = [...state.allRefunds.data, action.refund]
			} else {
				data = state.allRefunds.data
			}

			return {
				...state,
				allRefunds: {
				  ...state.allRefunds,
				  data
				},
				contributionRefunding: false
			}
		case 'FEE_PERCENT_LOADED':
			return {...state, feePercent: action.feePercent}
		default:
			return state
	}
}

const rootReducer = combineReducers({
	web3,
	dai,
	crowdfunder,
	form: formReducer
})

export default rootReducer