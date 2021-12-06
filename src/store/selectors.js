import { get, reject, groupBy } from 'lodash'
import { createSelector } from 'reselect'
import moment from 'moment'
import { futureTime, formatFunds, formatCost, formatBalance, GREEN, RED, BLUE, ORANGE, GREY } from '../helpers'
require('moment-countdown')

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)

const web3 = state => get(state, 'web3.connection')
export const web3Selector = createSelector(web3, w => w)

const daiLoaded = state => get(state, 'dai.loaded', false)
export const daiLoadedSelector = createSelector(daiLoaded, dl => dl)

const crowdfunderLoaded = state => get(state, 'crowdfunder.loaded', false)
export const crowdfunderLoadedSelector = createSelector(crowdfunderLoaded, cl => cl)

const deploymentLoaded = state => get(state, 'crowdfunder.deployment.loaded', false)

const crowdfunder = state => get(state, 'crowdfunder.contract', false)
export const crowdfunderSelector = createSelector(crowdfunder, cl => cl)

const deploymentBlock = state => get(state, 'crowdfunder.deployment.data.blockNumber', 'latest')
export const deploymentBlockSelector = createSelector(deploymentBlock, dep => dep)

const dai = state => get(state, 'dai.contract', false)
export const daiSelector = createSelector(dai, dl => dl)

export const contractsLoadedSelector = createSelector(
	daiLoaded,
	crowdfunderLoaded,
	deploymentLoaded,
	(dl, cl, dep) => (dl && cl && dep)
)

const daiBalance = state => get(state, 'dai.balance', null)
export const daiBalanceSelector = createSelector(daiBalance, balance => formatBalance(balance))

const payWithEth = state => get(state, 'crowdfunder.payWithEth', false)
export const payWithEthSelector = createSelector(payWithEth, bool => bool)

const allProjectsLoaded = state => get(state, 'crowdfunder.allProjects.loaded', false)
const allProjects = state => get(state, 'crowdfunder.allProjects.data', [])

const cancelledProjectsLoaded = state => get(state, 'crowdfunder.cancelledProjects.loaded', false)
const cancelledProjects = state => get(state, 'crowdfunder.cancelledProjects.data', [])

const successfulProjectsLoaded = state => get(state, 'crowdfunder.successfulProjects.loaded', false)
const successfulProjects = state => get(state, 'crowdfunder.successfulProjects.data', [])

const allRefundsLoaded = state => get(state, 'crowdfunder.allRefunds.loaded', false)
const allRefunds = state => get(state, 'crowdfunder.allRefunds.data', [])

const allContributionsLoaded = state => get(state, 'crowdfunder.allContributions.loaded', false)
const allContributions = state => get(state, 'crowdfunder.allContributions.data', [])


export const allRefundsLoadedSelector = createSelector(allRefundsLoaded, loaded => loaded)

const projectCancelling = state => get(state,'crowdfunder.projectCancelling', false)
export const projectCancellingSelector = createSelector(projectCancelling, status => status)

const projectFundsTransfering = state => get(state,'crowdfunder.projectFundsTransfering', false)
export const projectFundsTransferingSelector = createSelector(projectFundsTransfering, status => status)

const contributionRefunding = state => get(state,'crowdfunder.contributionRefunding', false)
export const contributionRefundingSelector = createSelector(contributionRefunding, status => status)

const ethCostLoading = state => get(state, 'crowdfunder.ethCostLoading', false)
export const ethCostLoadingSelector = createSelector(ethCostLoading, loading => loading)

const ethCost = state => get(state, 'crowdfunder.ethCost', '')
export const ethCostSelector = createSelector(ethCost, cost => formatCost(cost))

const formattedRefunds = state => allRefunds(state).map((refunds) => formatRefund(refunds))

const formatRefund = refund => {
	return({
		...refund,
		formattedRefundAmount: formatFunds(refund.refundAmount),
		formattedTimestamp: moment.unix(refund.timestamp).format('M/D/YYYY h:mm:ss a')
	})
}

const formattedProjects = state => {
	let projects = allProjects(state)
	const successful = successfulProjects(state)
	const cancelled = cancelledProjects(state)
	const allRefunds = formattedRefunds(state)
	projects = projects.map(project => formatProject(project, successful, cancelled, allRefunds)) 
	// Group all projects by "status"
	const groupedProjects = groupBy(projects, 'status')
	// Fetch open, cancelled, failed, sucessful and pending transfer projects
	projects = {
		allProjects: projects,
		openProjects: get(groupedProjects, 'OPEN', []),
		cancelledProjects: get(groupedProjects, 'CANCELLED', []),
		failedProjects: get(groupedProjects, 'FAILED', []),
		successfulProjects: get(groupedProjects, 'SUCCEEDED', []),
		pendingDisbursementProjects: get(groupedProjects, 'PENDING_DISBURSEMENT', [])
	}
	return projects
}

const formatProject = (project, successful, cancelled, allRefunds) => {
	// Determine if project has been cancelled
	const cancelledProject = cancelled.find((p) => project.id === p.id)
	// Determine if project funds have successfully transfered to creator
	const successfulProject = successful.find((p) => project.id === p.id)
	if(cancelledProject !== undefined) {
		project = { 
			...project,
			status: "CANCELLED",
			projectTypeClass: GREY,
			cancelledDate: moment.unix(cancelledProject.timestamp).format('M/D/YYYY h:mm:ss a'),
			refunds: refundInfo(project, allRefunds)
		}
	}
	else if(+project.timeGoal > futureTime(0)) {
		project = {
			...project,
			status: "OPEN",
			projectTypeClass: BLUE,
			timeLeft: moment.unix(+project.timeGoal).countdown().toString(),
		}
	}
	else if (project.raisedFunds < project.fundGoal) {
		project = {
			...project,
			status: "FAILED",
			projectTypeClass: RED,
			refunds: refundInfo(project, allRefunds)
		}
	}
	else if (successfulProject !== undefined) {
		project = {
			...project,
			status: "SUCCEEDED",
			projectTypeClass: GREEN,
			feeAmount: formatFunds(successfulProject.feeAmount),
			disburseAmount: formatFunds(successfulProject.disburseAmount), 
			disbursedDate: moment.unix(successfulProject.timestamp).format('M/D/YYYY h:mm:ss a')
		}
	}
	else {
		project = {
			...project,
			status: "PENDING_DISBURSEMENT",
			projectTypeClass: ORANGE
		}
	}
	const days = (+project.timeGoal - +project.timestamp)/86400
	const durationInDays = days < 10 ? Math.round(days*10)/10 /* Use 1 decimal */ : Math.round(days) //No decimals
	return({
		...project,
		formattedRaisedFunds: formatFunds(get(project, 'raisedFunds', 0)),
		formattedFundGoal: formatFunds(project.fundGoal),
		durationInDays,
		formattedTimestamp: moment.unix(project.timestamp).format('M/D/YYYY h:mm:ss a'),
		percentFunded: Math.round(get(project, 'raisedFunds', 0)*100/project.fundGoal),
		endDate: moment.unix(+project.timeGoal).format('M/D/YYYY h:mm:ss a')
	})
}

const refundInfo = (project, refunds) => {
	//Fetch refunds that apply to this project
	refunds = refunds.filter((r) => r.id === project.id)
	//Fetch latest refund 
	const latestRefund = refunds[refunds.length - 1]
	// Use raised funds data of latest refund to calculate total refund amount.
	const totalRefundAmount = +project.raisedFunds - +get(latestRefund, 'raisedFunds', +project.raisedFunds)
	const percentRefunded = Math.round(totalRefundAmount*100/project.raisedFunds)
	return({
		data: refunds,
		formattedTotalRefundAmount: formatFunds(totalRefundAmount),
		numberOfRefunds: refunds.length,
		percentRefunded
	})

}

const formattedProjectsLoaded = state => 
	allProjectsLoaded(state) && cancelledProjectsLoaded(state) && successfulProjectsLoaded(state) && allRefundsLoaded(state) && allContributionsLoaded(state)

export const formattedProjectsLoadedSelector = createSelector(formattedProjectsLoaded, loaded => loaded)

// Discover
export const discoverProjectsSelector = createSelector(
	formattedProjects,
	account,
	(projects, account) => {
		//fetch openProjects
		projects = projects.openProjects
		// filter openProjects by those whos creator is not the user
		projects = projects.filter((p) => p.creator !== account)
		return projects
	}	
)

const contribution = state => get(state, 'crowdfunder.contribution', {})
export const contributionSelector = createSelector(contribution, c => c)

// Create Project
const projectMaking = state => get(state, 'crowdfunder.projectMaking', false)
export const projectMakingSelector = createSelector(projectMaking, pm => pm)

const buffer = state => get(state, 'crowdfunder.buffer', null)
export const bufferSelector = createSelector(buffer, b => b)

//My Projects
const feePercent = state => get(state, 'crowdfunder.feePercent', null)
export const feePercentSelector = createSelector(feePercent, fp => fp)

export const myProjectsSelector = createSelector(
	formattedProjects,
	account,
	(projects, account) => projects.allProjects.filter((p) => p.creator === account)
)

export const myPendingDisbursementsSelector = createSelector(
	formattedProjects,
	account,
	feePercent,
	(projects, account, feePercent) => {
		// fetch pendingDisbursementProjects
		projects = projects.pendingDisbursementProjects
		// filter projects by user
		projects = projects.filter((p) => p.creator === account)
		return projects
	}
)

export const myOpenProjectsSelector = createSelector(
	formattedProjects,
	account,
	(projects, account) => {
		//fetch openProjects
		projects = projects.openProjects
		//filter by projects that are created by the user
		projects = projects.filter((p) => p.creator === account)
		return projects
	}
)

export const myClosedProjectsSelector = createSelector(
	formattedProjects,
	account,
	(projects, account) => {
		// take out all projects that are either open or pending transfer
		projects = reject(projects.allProjects, (project) => {
			const open = projects.openProjects.some((p) => get(p,'id', null) === get(project,'id', null))
			const pendingDisbursement = projects.pendingDisbursementProjects.some((p) => get(p,'id', null) === get(project,'id', null))
			return(open || pendingDisbursement)
		})
		// filter projects created by user
		projects = projects.filter((p) => p.creator === account)
		return projects
	}
)

//My Contributions

const formattedContributions = state => 
	allContributions(state).map((contribution) => 
		formatContribution(contribution, formattedProjects(state))
	)

const formatContribution = (contribution, projects) => {
	return({
		...contribution,
		project: projects.allProjects[contribution.id - 1],
		formattedRaisedFunds: formatFunds(contribution.raisedFunds),
		formattedFundAmount: formatFunds(contribution.fundAmount),
		formattedTimestamp: moment.unix(contribution.timestamp).format('M/D/YYYY h:mm:ss a')
	})
}


const myFormattedContributions = state => formattedContributions(state).filter((c) => c.supporter === account(state))

const formattedContributionsLoaded = state => formattedProjectsLoaded(state)

export const formattedContributionsLoadedSelector = createSelector(formattedContributionsLoaded, (loaded) => loaded)

export const myRefundableContributionsSelector = createSelector(
	myFormattedContributions,
	(contributions) => {
		// fetch contributions to projects that have either cancelled or failed
		contributions = contributions.filter((c) => get(c, 'project.status', null) === 'CANCELLED' || get(c, 'project.status', null) === 'FAILED')
		// fetch contributions that haven't been refunded by the user
		contributions = reject(contributions, (c) => c.project.refunds.data.some((r) => r.supporter === c.supporter))  
		return(contributions)
	}
)


export const myHeldContributionsSelector = createSelector (
	myFormattedContributions,
	(contributions) => contributions.filter((c) => get(c, 'project.status', null) === 'OPEN' || get(c, 'project.status', null) === 'PENDING_TRANSFER')
)

export const myReleasedContributionsSelector = createSelector (
	myFormattedContributions,
	(contributions) => {
		// fetch contributions to projects that are not open or pending transfer
		contributions = reject(contributions, (c) => get(c, 'project.status', null) === 'OPEN' || get(c, 'project.status', null) === 'PENDING_TRANSFER')
		// fetch contributions that have been refunded by user if the project cancelled or failed
		contributions = contributions.filter((c) => get(c, 'project.status', null) === "SUCCEEDED" ? true : get(c, 'project.refunds.data', []).some((r) => r.supporter === c.supporter))
		return(contributions)
	}
)

//Transactions
export const transactionsLoadedSelector = createSelector (formattedContributionsLoaded, (loaded) => loaded)

export const disbursementsSelector = createSelector (
	formattedProjects,
	(projects) => {
		//fetch successful projects
		projects = projects.successfulProjects
		return projects
	}
)

export const contributionsSelector = createSelector (
	formattedContributions,
	(contributions) => contributions
)

export const refundsSelector = createSelector (
	formattedRefunds,
	formattedProjects,
	(refunds, projects) => {
		// add the project associted with this refund to the refund object
		refunds = refunds.map((refund) => {
			return({
				...refund,
				project: projects.allProjects[refund.id - 1]
			})
		})
		return(refunds)
	}
)


