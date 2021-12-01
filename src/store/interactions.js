import { get } from 'lodash'
import {
	web3Loaded,
	web3AccountLoaded,
	daiLoaded,
	crowdfunderLoaded,
	deploymentDataLoaded,
	cancelledProjectsLoaded,
	successfulProjectsLoaded,
	allProjectsLoaded,
	ethCostLoading,
	ethCostLoaded,
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
	daiBalanceLoaded,
	defaultPaymentMethodSet
} from './actions'
import Web3 from 'web3'
import Crowdfunder from '../abis/Crowdfunder.json'
import { futureTime } from '../helpers'

// spliced ERC20 ABI
const splicedABI = [
	// balanceOf
	{
		"stateMutability": "view",
		"inputs": [{ "name": "_owner", "type": "address" }],
		"name": "balanceOf",
		"outputs": [{ "name": "balance", "type": "uint256" }],
		"type": "function"
	},
	// decimals
	{
		"stateMutability": "view",
		"inputs": [],
		"name": "decimals",
		"outputs": [{ "name": "", "type": "uint8" }],
		"type": "function"
	},
	// approve
	{
		"stateMutability": "nonpayable",
		"inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }],
		"name": "approve",
		"outputs": [{ "name": "", "type": "bool" }],
		"type": "function"
	}

];

//Declare IPFS
const { create } = require('ipfs-http-client')
const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

export const loadWeb3 = async (dispatch) => {
	if (window.ethereum) {
		window.web3 = new Web3(window.ethereum)
		await window.ethereum.enable()
		dispatch(web3Loaded(window.web3))
		return window.web3
	}
	else if (window.web3) {
		window.web3 = new Web3(window.web3.currentProvider)
		dispatch(web3Loaded(window.web3))
		return window.web3
	}
	else {
		window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
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

export const loadDai = async (web3, dispatch) => {
	try {
		// Create new web3 dai contract instance
		const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
		const dai = new web3.eth.Contract(splicedABI, daiAddress)
		dispatch(daiLoaded(dai))
		return dai
	} catch (error) {
		console.log('Contract not deployed to the current network. Please select another network with Metamask.')
		return null
	}

}

export const loadCrowdfunder = async (web3, networkId, dispatch) => {
	try {
		// Create new web3 crowdfunder contract insatnce
		const crowdfunder = new web3.eth.Contract(Crowdfunder.abi, Crowdfunder.networks[networkId].address)
		dispatch(crowdfunderLoaded(crowdfunder))
		//Fetch crowdfunder contract deployment data
		const deploymentData = await web3.eth.getTransaction(Crowdfunder.networks[networkId].transactionHash)
		dispatch(deploymentDataLoaded(deploymentData))
		return crowdfunder
	} catch (error) {
		console.log('Contract not deployed to the current network. Please select another network with Metamask.')
		return null
	}

}


export const loadDaiBalance = async (dai, dispatch, account) => {
	const daiBalance = await dai.methods.balanceOf(account).call()
	console.log(daiBalance)
	dispatch(daiBalanceLoaded(daiBalance))
	// Set default payment method
	dispatch(defaultPaymentMethodSet(daiBalance.toString() === '0'))
}

export const loadAllCrowdfunderData = async (crowdfunder, deployment, dispatch) => {
	// Get the block number where the deployment took place in
	const startingBlock = deployment.blockNumber
	// Fetch refunds with the "Refund" event stream
	const refundStream = await crowdfunder.getPastEvents("Refund", { fromBlock: startingBlock, toBlock: 'latest' })
	// Format refunds
	const allRefunds = refundStream.map((event) => event.returnValues)
	// Add refunds to the redux store
	dispatch(allRefundsLoaded(allRefunds))

	// Fetch contributions with the "Contribution" event stream
	const contributionStream = await crowdfunder.getPastEvents('Contribution', { fromBlock: startingBlock, toBlock: 'latest' })
	// Format contributions
	const allContributions = contributionStream.map((event) => event.returnValues)
	// Add refunds to the redux store
	dispatch(allContributionsLoaded(allContributions))

	// Fetch cancelled projects with the "Cancel" event stream
	const cancelStream = await crowdfunder.getPastEvents('Cancel', { fromBlock: startingBlock, toBlock: 'latest' })
	// Format cancelled orders
	const cancelledProjects = cancelStream.map((event) => event.returnValues)
	// Add cancelled orders to the redux store
	dispatch(cancelledProjectsLoaded(cancelledProjects))

	// Fetch successful projects with the "Disburse" event stream
	const disburseStream = await crowdfunder.getPastEvents('Disburse', { fromBlock: startingBlock, toBlock: 'latest' })
	// Format successfulProjects
	const successfulProjects = disburseStream.map((event) => event.returnValues)
	// Add successfulProjects projects to the redux store
	dispatch(successfulProjectsLoaded(successfulProjects))
	// Fetch all projects with the "ProjectMade" event stream
	const projectStream = await crowdfunder.getPastEvents('ProjectMade', { fromBlock: startingBlock, toBlock: 'latest' })
	// Format all projects
	const allProjects = await projectStream.map((event) => event.returnValues)

	for (let i = 0; i < allProjects.length; i++) {
		const contributions = allContributions.filter((c) => c.id === allProjects[i].id)
		const newSupporters = contributions.filter((c) => c.newSupporter === true)
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

export const quoteEthCost = async(dispatch, web3, amount, crowdfunder) => {
	if (amount) {
		amount = web3.utils.toWei(amount, 'ether')
		dispatch(ethCostLoading())
		try {
			const result = await crowdfunder.methods.getEthInputAmount(amount).call()
			dispatch(ethCostLoaded(result))
			return result
		} catch(error){
			window.alert("Could not fetch quoted ETH cost, please try again later")
			console.log("Could not fetch quoted ETH cost")
			return null
		}
	} else {
		dispatch(ethCostLoaded(amount))
		return amount
	}
}

export const contributeToProject = async (dispatch, web3, amount, cost, account, id, crowdfunder, dai) => {
	if (cost > 0) {
		// Quote eth cost again to get latest cost
		cost = await quoteEthCost(dispatch, web3, amount, crowdfunder)
		// Increase the quoted cost by 10 percent to ensure the transaction goes through.
		// The ETH thats leftover will be automatically refunded back to the user.
		cost = Math.floor(1.1 * (cost))
		// Send contribute function with ETH cost.
		amount = web3.utils.toWei(amount, 'ether')
		crowdfunder.methods.contribute(id, amount, futureTime(15)).send({ from: account, value: cost })
			.on('transactionHash', (hash) => {
				dispatch(contributingToProject(dispatch))
			})
			.on('error', (error) => {
				console.error(error)
				window.alert(`There was an error!`)
			})
	} else {
		amount = web3.utils.toWei(amount, 'ether')
		// Fetch project address
		const projectAddress = await crowdfunder.methods.projects(id).call()
		// Approve project to spend users DAI
		dai.methods.approve(projectAddress, amount).send({ from: account })
			.on('transactionHash', (hash) => {
				crowdfunder.methods.contribute(id, amount, futureTime(15)).send({ from: account })
					.on('transactionHash', (hash) => {
						dispatch(contributingToProject(dispatch))
					})
					.on('error', (error) => {
						console.error(error)
						window.alert(`There was an error!`)
					})
			})
	}
}


export const makeProject = async (dispatch, web3, project, buffer, account, crowdfunder) => {
	const fundGoalAmount = web3.utils.toWei((project.fundGoal).toString(), 'ether')
	// Convert time goal in days to future epoch time.
	const timeGoal = (futureTime(+project.timeGoal * 86400))
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
	crowdfunder.methods.cancel(id).send({ from: account })
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