import { get, reject } from 'lodash'
import { createSelector } from 'reselect'
import moment from 'moment'
import { futureTime, formatFunds } from '../helpers'
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

const allRefundsLoaded = state => get(state, 'crowdfunder.allRefunds.loaded', false)
export const allRefundsLoadedSelector = createSelector(allRefundsLoaded, loaded => loaded)

const allRefunds = state => get(state, 'crowdfunder.allRefunds.data', [])

const openProjects = state => {
	const all = allProjects(state)
	const cancelled = cancelledProjects(state)

	const openProjects = reject(all, (project) => {
		const projectCancelled = cancelled.some((p) => project.id === p.id) 
		const userIsProjectCreator = (project.creator === account(state))
		const projectClosed = (+project.timeGoal + +project.timestamp < futureTime(0))
		return(projectCancelled || projectClosed || userIsProjectCreator)
	})
	return openProjects
}

const projectsLoaded = state => allProjectsLoaded(state) && cancelledProjectsLoaded(state) && successfulProjectsLoaded(state)
export const projectsLoadedSelector = createSelector(projectsLoaded, loaded => loaded)

export const openProjectsSelector = createSelector(
	openProjects,
	(projects) => {
		projects = formatOpenProjects(projects)
		return projects
	}	
)

const formatOpenProjects = (projects) => {
	return(
		projects.map((project) => {
			project = formatProject(project)
			return project
		})
	)
}

const formatProject = (project) => {
	return({
		...project,
		formattedTotalFunds: formatFunds(project.totalFunds),
		formattedFundGoal: formatFunds(project.fundGoal),
		timeLeft: moment.unix(+project.timeGoal + +project.timestamp).countdown().toString(),
		timeGoalInDays: (+project.timeGoal/86400),
		formattedTimestamp: moment.unix(project.timestamp).format('M/D/YYYY h:mm:ss a')
	})
}

const contribution = state => get(state, 'crowdfunder.contribution', {})
export const contributionSelector = createSelector(contribution, c => c)

const projectMaking = state => get(state, 'crowdfunder.projectMaking', false)
export const projectMakingSelector = createSelector(projectMaking, pm => pm)

const buffer = state => get(state, 'crowdfunder.buffer', null)
export const bufferSelector = createSelector(buffer, b => b)


export const myProjectsSelector = createSelector(
	allProjects,
	successfulProjects,
	cancelledProjects,
	allRefunds,
	account,
	(projects, successfulProjects, cancelledProjects, allRefunds, account) => {
		// Find our projects 
		projects = projects.filter((p) => p.creator === account)
		// Find our successful funded projects
		successfulProjects = successfulProjects.filter((p) => p.creator === account)
		// Find our cancelled projects
		cancelledProjects = cancelledProjects.filter((p) => p.creator === account)

		projects = formatMyProjects(projects, successfulProjects, cancelledProjects, allRefunds) 
		return projects
	}	
)

const formatMyProjects = (projects, successfulProjects, cancelledProjects, allRefunds) => {
	return(
		projects.map((project) => {
			project = formatProject(project)
			project = formatMyProject(project, successfulProjects, cancelledProjects, allRefunds)
			return project
		})
	)
}

const formatMyProject = (project, successfulProjects, cancelledProjects, allRefunds) => {
	// Determine if project has been cancelled
	const cancelledProject = cancelledProjects.find((p) => project.id === p.id)
	// Determine if project funds have successfully transfered to creator
	const successfulProject = successfulProjects.find((p) => project.id === p.id)
	if(cancelledProject !== undefined) {
		const r = MyRefunds(project, allRefunds)
		project = { 
			...project,
			status: "CANCELLED",
			cancelledDate: moment.unix(cancelledProject.timestamp).format('M/D/YYYY h:mm:ss a'),
			backgroundColor: "#FFC77F",
			barColor: "#F88A03",
			totalRefundAmount: r.totalRefundAmount, 
			numberOfRefunds: r.numberOfRefunds
		}
	}
	else if(+project.timeGoal + +project.timestamp > futureTime(0)) {
		project = {
			...project,
			status: "OPEN",
			backgroundColor: "#74B3FC",
			barColor: "#0075FF"
		}
	}
	else if (project.totalFunds < project.fundGoal) {
		const r = MyRefunds(project, allRefunds)
		project = {
			...project,
			status: "FAILED",
			backgroundColor: "#FF7F7F",
			barColor: "#FA0303",
			totalRefundAmount: r.totalRefundAmount, 
			numberOfRefunds: r.numberOfRefunds
		}
	}
	else if (successfulProject !== undefined) {
		project = {
			...project,
			status: "SUCCEEDED",
			transferedDate: moment.unix(successfulProject.timestamp).format('M/D/YYYY h:mm:ss a'),
			backgroundColor: "#82FF7F",
			barColor: "#06FA01"
		}
	}
	else {
		project = {
			...project,
			status: "PENDING_TRANSFER",
			backgroundColor: "#FBFC74",
			barColor: "#FAFC01"
		}
	}

	return({
		...project,
		endDate: moment.unix(+project.timeGoal + +project.timestamp).format('M/D/YYYY h:mm:ss a')
	})
}

const MyRefunds = (project, allRefunds) => {
	// Filter by refunds that applied to this particular project
	const refunds = allRefunds.filter((r) => project.id === r.id)
	// Add up all the refunds to aquire refund total
	let totalRefundAmount = 0
	for(var i = 0 ; i < refunds.length ; i++) {
		totalRefundAmount += refunds[i].refundAmount
	}
	return({
		totalRefundAmount: formatFunds(totalRefundAmount),
		numberOfRefunds: refunds.length
	})
}