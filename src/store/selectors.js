import { get, reject, groupBy, without } from 'lodash'
import { createSelector } from 'reselect'
import moment from 'moment'
import { futureTime, formatFunds, GREEN, RED, BLUE, ORANGE, GREY, DARK_GREY } from '../helpers'
require('moment-countdown')

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)

const web3 = state => get(state, 'web3.connection')
export const web3Selector = createSelector(web3, w => w)

const daiLoaded = state => get(state, 'dai.loaded', false)
export const daiLoadedSelector = createSelector(daiLoaded, dl => dl)

const crowdfunderLoaded = state => get(state, 'crowdfunder.loaded', false)
export const crowdfunderLoadedSelector = createSelector(crowdfunderLoaded, cl => cl)

const crowdfunder = state => get(state, 'crowdfunder.contract', false)
export const crowdfunderSelector = createSelector(crowdfunder, cl => cl)

const dai = state => get(state, 'dai.contract', false)
export const daiSelector = createSelector(dai, dl => dl)

export const contractsLoadedSelector = createSelector(
	daiLoaded,
	crowdfunderLoaded,
	(dl, cl) => (dl && cl)
)

const allProjectsLoaded = state => get(state, 'crowdfunder.allProjects.loaded', false)
const allProjects = state => get(state, 'crowdfunder.allProjects.data', [])

const cancelledProjectsLoaded = state => get(state, 'crowdfunder.cancelledProjects.loaded', false)
const cancelledProjects = state => get(state, 'crowdfunder.cancelledProjects.data', [])

const successfulProjectsLoaded = state => get(state, 'crowdfunder.successfulProjects.loaded', false)
const successfulProjects = state => get(state, 'crowdfunder.successfulProjects.data', [])

const allRefunds = state => get(state, 'crowdfunder.allRefunds.data', [])
const allRefundsLoaded = state => get(state, 'crowdfunder.allRefunds.loaded', false)
export const allRefundsLoadedSelector = createSelector(allRefundsLoaded, loaded => loaded)

const projectCancelling = state => get(state,'crowdfunder.projectCancelling', false)
export const projectCancellingSelector = createSelector(projectCancelling, status => status)

const projectFundsTransfering = state => get(state,'crowdfunder.projectFundsTransfering', false)
export const projectFundsTransferingSelector = createSelector(projectFundsTransfering, status => status)

const allContributionsLoaded = state => get(state, 'crowdfunder.allContributions.loaded', false)
const allContributions = state => get(state, 'crowdfunder.allContributions.data', [])

const contributionRefunding = state => get(state,'crowdfunder.contributionRefunding', false)
export const contributionRefundingSelector = createSelector(contributionRefunding, status => status)

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
	projects = projects.map((project) => formatProject(project, successful, cancelled, allRefunds)) 
	// Group all projects by "status"
	const groupedProjects = groupBy(projects, 'status')
	// Fetch open, cancelled, failed, sucessful and pending transfer projects
	projects = {
		allProjects: projects,
		openProjects: get(groupedProjects, 'OPEN', []),
		cancelledProjects: get(groupedProjects, 'CANCELLED', []),
		failedProjects: get(groupedProjects, 'FAILED', []),
		successfulProjects: get(groupedProjects, 'SUCCEEDED', []),
		pendingTransferProjects: get(groupedProjects, 'PENDING_TRANSFER', [])
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
	else if(+project.timeGoal + +project.timestamp > futureTime(0)) {
		project = {
			...project,
			status: "OPEN",
			projectTypeClass: BLUE,
			timeLeft: moment.unix(+project.timeGoal + +project.timestamp).countdown().toString(),
		}
	}
	else if (project.totalFunds < project.fundGoal) {
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
			feeAmount: formatFunds(successfulProject.transferAmount),
			transferAmount: formatFunds(successfulProject.transferAmount), 
			transferedDate: moment.unix(successfulProject.timestamp).format('M/D/YYYY h:mm:ss a'),
		}
	}
	else {
		project = {
			...project,
			status: "PENDING_TRANSFER",
			projectTypeClass: ORANGE, 
		}
	}
	return({
		...project,
		formattedTotalFunds: formatFunds(project.totalFunds),
		formattedFundGoal: formatFunds(project.fundGoal),
		timeGoalInDays: (+project.timeGoal/86400),
		formattedTimestamp: moment.unix(project.timestamp).format('M/D/YYYY h:mm:ss a'),
		percentFunded: Math.round(project.totalFunds*100/project.fundGoal),
		endDate: moment.unix(+project.timeGoal + +project.timestamp).format('M/D/YYYY h:mm:ss a')
	})
}

const refundInfo = (project, refunds) => {
	// Filter by refunds that applied to this particular project
	refunds = refunds.filter((r) => project.id === r.id)
	// Add up all the refunds to aquire refund total
	let totalRefundAmount = 0
	for(var i = 0 ; i < refunds.length ; i++) {
		totalRefundAmount += refunds[i].refundAmount
	}
	return({
		data: refunds,
		totalRefundAmount: formatFunds(totalRefundAmount),
		numberOfRefunds: refunds.length,
		percentRefunded: Math.round(totalRefundAmount*100/project.totalFunds)
	})

}

const formattedProjectsLoaded = state => 
	allProjectsLoaded(state) && cancelledProjectsLoaded(state) && successfulProjectsLoaded(state) && allRefundsLoaded(state)

export const formattedProjectsLoadedSelector = createSelector(formattedProjectsLoaded, loaded => loaded)

// Discover
export const discoverProjectsSelector = createSelector(
	formattedProjects,
	account,
	(projects, account) => {
		//fetch openProjects
		projects = projects.openProjects
		// filter openProjects by those whos creator is not the user
		projects.filter((p) => p.creator !== account)
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

export const myPendingTransfersSelector = createSelector(
	formattedProjects,
	account,
	feePercent,
	(projects, account, feePercent) => {
		// fetch pendingTransferProjects
		projects = projects.pendingTransferProjects
		// filter projects by user
		projects = projects.filter((p) => p.creator === account)
		// Add up all the totalFunds from each pending transfer project 
		let totalCollectedProjectFunds = 0
		projects.forEach((project) => {
			totalCollectedProjectFunds += project.totalFunds
		})  
		return({
			projects,
			totalPendingTransferFunds: totalCollectedProjectFunds * (1 - feePercent/100),
			totalPendingTransferFee: totalCollectedProjectFunds * (feePercent/100)
		})
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
			const open = projects.openProjects.some((p) => p.id === project.id)
			const pendingTransfer = projects.pendingTransferProjects.some((p) => p.id === project.id)
			return(open || pendingTransfer)
		})
		// filter projects created by user
		projects = projects.filter((p) => p.creator === account)
		return projects
	}
)

//My Contributions
const formattedContributions = state => 
	allContributions(state).map((contribution) => 
		formatContribution(contribution, formattedProjects(state).allProjects[contribution.id - 1])
	)

const formatContribution = (contribution, project) => {
	return({
		...contribution,
		project,
		formattedTotalFunds: formatFunds(contribution.totalFunds),
		formattedFundAmount: formatFunds(contribution.fundAmount),
		formattedTimestamp: moment.unix(contribution.timestamp).format('M/D/YYYY h:mm:ss a')
	})
}

const myFormattedContributions = state => formattedContributions(state).filter((c) => c.supporter === account(state))

const formattedContributionsLoaded = state => formattedProjectsLoaded(state) && allContributions(state)

export const formattedContributionsLoadedSelector = createSelector(formattedContributionsLoaded, (loaded) => loaded)

export const myPendingContributionRefundsSelector = createSelector(
	myFormattedContributions,
	account,
	(contributions, account) => {
		// fetch contributions to projects that have either cancelled or failed
		contributions = contributions.filter((c) => c.project.status === 'CANCELLED' || c.project.status === 'FAILED')
		// fetch contributions that haven't been refunded by user
		contributions = contributions.filter((c) => c.project.refunds.data.some((r) => get(r, 'supporter', null) !== account))
		return(contributions)
	}
)

export const myHeldContributionsSelector = createSelector (
	myFormattedContributions,
	(contributions) => contributions.filter((c) => c.project.status === 'OPEN' || c.project.status === 'PENDING_TRANSFER')
)

export const myReleasedContributionsSelector = createSelector (
	myFormattedContributions,
	(contributions) => {
		// fetch contributions to projects that are not open or pending transfer
		contributions = contributions.filter((c) => c.project.status !== 'OPEN' || c.project.status !== 'PENDING_TRANSFER')
		// fetch contributions that have been refunded by user
		contributions = contributions.filter((c) => get(c, 'project.refunds.data', []).some((r) => get(r, 'supporter', null) === account))
		return(contributions)
	}
)

//Transactions

export const transfersSelector = createSelector (
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
		refunds.map((refund) => {
			return({
				...refund,
				project: projects.allProjects[refund.id - 1]
			})
		})
	}
)


