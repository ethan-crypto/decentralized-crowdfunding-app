//WEB3
export function web3Loaded(connection) {
	return {
		type: 'WEB3_LOADED',
		connection
	}
}

export function web3AccountLoaded(account) {
	return {
		type: 'WEB3_ACCOUNT_LOADED',
		account
	}
}

//DAI
export function daiLoaded(contract) {
	return {
		type: 'DAI_LOADED',
		contract
	}
}
//SWAP
export function swapLoaded(contract) {
	return {
		type: 'SWAP_LOADED',
		contract
	}
}

//CROWDFUNDER
export function crowdfunderLoaded(contract) {
	return {
		type: 'CROWDFUNDER_LOADED',
		contract
	}
}

export function deploymentDataLoaded(deployment) {
	return {
		type: 'DEPLOYMENT_DATA_LOADED',
		deployment
	}
}

export function defaultPaymentMethodSet(bool) {
	return {
		type: 'DEFUALT_PAYMENT_METHOD_SET',
		bool
	}
}

export function cancelledProjectsLoaded(cancelledProjects) {
	return {
		type: 'CANCELLED_PROJECTS_LOADED',
		cancelledProjects
	}
}

export function successfulProjectsLoaded(successfulProjects) {
	return {
		type: 'SUCCESSFUL_PROJECTS_LOADED',
		successfulProjects
	}
}

export function allProjectsLoaded(allProjects) {
	return {
		type: 'ALL_PROJECTS_LOADED',
		allProjects
	}
}

export function paymentMethodToggled() {
	return {
		type: 'PAYMENT_METHOD_TOGGLED'
	}
}

export function contributingToProject() {
	return {
		type: 'CONTRIBUTING_TO_PROJECT'
	}
}

export function contributionAmountChanged(amount, id) {
	return {
		type: 'CONTRIBUTION_AMOUNT_CHANGED',
		amount,
		id
	}
}

export function contributedToProject(contribution) {
	return {
		type: 'CONTRIBUTED_TO_PROJECT',
		contribution
	}
}

export function projectMaking() {
	return {
		type: 'PROJECT_MAKING'
	}
}

export function projectMade(project) {
	return {
		type: 'PROJECT_MADE',
		project
	}
}

export function imageFileCaptured(buffer) {
	return {
		type: 'IMAGE_FILE_CAPTURED',
		buffer
	}
}

export function projectCancelling() {
	return {
		type: 'PROJECT_CANCELLING'
	}
}

export function projectCancelled(project) {
	return {
		type: 'PROJECT_CANCELLED',
		project
	}
}

export function allRefundsLoaded(refunds) {
	return {
		type: 'ALL_REFUNDS_LOADED',
		refunds
	}
}

export function projectFundsDisbursing() {
	return {
		type: 'PROJECT_FUNDS_DISBURSING',
	}
}

export function projectFundsDisbursed(project) {
	return {
		type: 'PROJECT_FUNDS_DISBURSED',
		project
	}
}

export function allContributionsLoaded(contributions) {
	return {
		type: 'ALL_CONTRIBUTIONS_LOADED',
		contributions
	}
}

export function contributionRefunding() {
	return {
		type: 'CONTRIBUTION_REFUNDING',
	}
}

export function contributionRefunded(refund) {
	return {
		type: 'CONTRIBUTION_REFUNDED',
		refund
	}
}

export function feePercentLoaded(percent) {
	return {
		type: 'FEE_PERCENT_LOADED',
		percent
	}
}

export function daiBalanceLoaded(balance) {
	return {
		type: 'DAI_BALANCE_LOADED',
		balance
	}
}




