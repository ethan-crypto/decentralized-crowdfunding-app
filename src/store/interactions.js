import { get } from 'lodash'
import {
	web3Loaded,
	web3AccountLoaded,
	daiLoaded,
	crowdfunderLoaded,
	cancelledProjectsLoaded,
	successfulProjectsLoaded,
	allProjectsLoaded,
	contributingToProject,
	contributedToProject,
	projectMaking,
	projectMade,
	projectCancelling,
	projectCancelled,
	allRefundsLoaded,
	projectFundsDisbursing,
	projectFundsDisbursed,
	allContributionsLoaded,
	contributionRefunding,
	contributionRefunded,
	feePercentLoaded,
	daiBalanceLoaded
} from './actions'
import Web3 from 'web3'
import MockDai from '../abis/MockDai.json'
import Crowdfunder from '../abis/Crowdfunder.json'
import Project from '../abis/Project.json'

//Declare IPFS
const { create } = require('ipfs-http-client')
const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

export const loadWeb3 = async (dispatch) => {
	if (typeof window.ethereum !== 'undefined') {
		const web3 = new Web3(window.ethereum)
		dispatch(web3Loaded(web3))
		return web3
	} else {
		window.alert('Please install MetaMask')
		window.location.assign("https://metamask.io/")
	}
}

export const loadAccount = async (web3, dispatch) => {
	const accounts = await web3.eth.getAccounts()
	console.log(accounts)
	const account = accounts[0]
	if (typeof account !== 'undefined') {
		dispatch(web3AccountLoaded(account))
		return account
	} else {
		window.alert('Please login with MetaMask')
		return null
	}
}

export const loadDai = async (web3, networkId, dispatch) => {
	try {
		console.log(networkId)
		const dai = new web3.eth.Contract(MockDai.abi, MockDai.networks[networkId].address)
		dispatch(daiLoaded(dai))
		return dai
	} catch (error) {
		console.log('Contract not deployed to the current network. Please select another network with Metamask.')
		return null
	}

}

export const loadCrowdfunder = async (web3, networkId, dispatch) => {
	try {
		const crowdfunder = new web3.eth.Contract(Crowdfunder.abi, Crowdfunder.networks[networkId].address)
		dispatch(crowdfunderLoaded(crowdfunder))
		return crowdfunder
	} catch (error) {
		console.log('Contract not deployed to the current network. Please select another network with Metamask.')
		return null
	}

}

export const loadDaiBalance = async (dai, dispatch, account) => {
	const daiBalance = await dai.methods.balanceOf(account).call()
	dispatch(daiBalanceLoaded(daiBalance))
}

export const loadAllCrowdfunderData = async (crowdfunder, dispatch) => {
	// Fetch refunds with the "Refund" event stream
	const refundStream = await crowdfunder.getPastEvents('Refund', { fromBlock: 0, toBlock: 'latest' })
	// Format refunds
	const allRefunds = refundStream.map((event) => event.returnValues)
	// Add refunds to the redux store
	dispatch(allRefundsLoaded(allRefunds))
	// Fetch contributions with the "Contribution" event stream
	const contributionStream = await crowdfunder.getPastEvents('Contribution', { fromBlock: 0, toBlock: 'latest' })
	// Format contributions
	const allContributions = contributionStream.map((event) => event.returnValues)
	// Add refunds to the redux store
	console.log(allContributions)
	dispatch(allContributionsLoaded(allContributions))

	// Fetch cancelled projects with the "Cancel" event stream
	const cancelStream = await crowdfunder.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' })
	// Format cancelled orders
	const cancelledProjects = cancelStream.map((event) => event.returnValues)
	// Add cancelled orders to the redux store
	dispatch(cancelledProjectsLoaded(cancelledProjects))

	// Fetch successful projects with the "Disburse" event stream
	const disburseStream = await crowdfunder.getPastEvents('Disburse', { fromBlock: 0, toBlock: 'latest' })
	// Format successfulProjects
	const successfulProjects = disburseStream.map((event) => event.returnValues)
	// Add successfulProjects projects to the redux store
	dispatch(successfulProjectsLoaded(successfulProjects))
	// Fetch all projects with the "ProjectMade" event stream
	const projectStream = await crowdfunder.getPastEvents('ProjectMade', { fromBlock: 0, toBlock: 'latest' })
	// Format all projects
	const allProjects = await projectStream.map((event) => event.returnValues)

	for (var i = 0; i < allProjects.length; i++) {
		const contributions = allContributions.filter((c) => c.id === allProjects[i].id)
		const newSupporters = contributions.filter((c) => c.newSupporter === true)
		console.log(contributions)
		allProjects[i] = {
			...allProjects[i],
			raisedFunds: get(contributions[contributions.length - 1], 'raisedFunds', 0),
			supporterCount: newSupporters.length
		}
	}
	// Add all projects to the redux store
	dispatch(allProjectsLoaded(allProjects))
}

export const subscribeToEvents = async (crowdfunder, dispatch) => {

	crowdfunder.events.Contribution({}, (error, event) => {
		dispatch(contributedToProject(event.returnValues))
	})
	crowdfunder.events.ProjectMade({}, (error, event) => {
		dispatch(projectMade(event.returnValues))
	})
	crowdfunder.events.Cancel({}, (error, event) => {
		dispatch(projectCancelled(event.returnValues))
	})
	crowdfunder.events.Disburse({}, (error, event) => {
		dispatch(projectFundsDisbursed(event.returnValues))
	})
	crowdfunder.events.Refund({}, (error, event) => {
		dispatch(contributionRefunded(event.returnValues))
	})
}


export const contributeToProject = async (dispatch, web3, amount, account, id, crowdfunder, dai) => {
	amount = web3.utils.toWei(amount, 'ether')
	//Fetch project address
	const projectAddress = await crowdfunder.methods.projects(id).call()
	dai.methods.approve(projectAddress, amount).send({ from: account })
		.on('transactionHash', (hash) => {
			crowdfunder.methods.contribute(id, amount).send({ from: account })
				.on('transactionHash', (hash) => {
					dispatch(contributingToProject(dispatch))
				})
				.on('error', (error) => {
					console.error(error)
					window.alert(`There was an error!`)
				})
		})
}

export const makeProject = async (dispatch, web3, project, buffer, account, crowdfunder) => {
	const fundGoalAmount = web3.utils.toWei((project.fundGoal).toString(), 'ether')
	const timeGoal = (project.timeGoal * 86400)
	console.log("Submitting image file to ipfs...")
	//adding file to the IPFS
	const result = await ipfs.add(buffer)
	console.log(project)
	console.log(result)

	crowdfunder.methods.makeProject(project.name, project.description, result.path, fundGoalAmount, timeGoal).send({ from: account }).on('transactionHash', (hash) => {
		dispatch(projectMaking())
	})
		.on('error', (error) => {
			console.error(error)
			window.alert(`There was an error!`)
		})

}

export const cancelProject = (dispatch, web3, account, id, crowdfunder) => {
	crowdfunder.methods.cancelProject(id).send({ from: account })
		.on('transactionHash', (hash) => {
			dispatch(projectCancelling())
		})
		.on('error', (error) => {
			console.log(error)
			window.alert('There was an error!')
		})
}

export const disburseProjectFunds = (dispatch, web3, account, id, crowdfunder) => {
	crowdfunder.methods.disburse(id).send({ from: account })
		.on('transactionHash', (hash) => {
			dispatch(projectFundsDisbursing())
		})
		.on('error', (error) => {
			console.log(error)
			window.alert('There was an error!')
		})
}

export const loadFeePercent = async (dispatch, web3, crowdfunder, account) => {
	const feePercent = await crowdfunder.methods.projectCount().call()
	dispatch(feePercentLoaded(feePercent))
}

export const refundContribution = (dispatch, web3, account, id, crowdfunder) => {
	crowdfunder.methods.claimRefund(id).send({ from: account })
		.on('transactionHash', (hash) => {
			dispatch(contributionRefunding())
		})
		.on('error', (error) => {
			console.log(error)
			window.alert('There was an error!')
		})
}