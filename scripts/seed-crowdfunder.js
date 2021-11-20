const { time } = require('@openzeppelin/test-helpers')
const Swap = artifacts.require("Swap");
const Crowdfunder = artifacts.require("Crowdfunder");
const IERC20 = artifacts.require("IERC20")
import { futureTime, wait, fromWei, toWei, daiToken, mainnetDai, mainnetWeth } from '../src/helpers'

const THIRTY_DAYS = time.duration.days(30)
const FOURTEEN_DAYS = time.duration.days(14)

const daysAhead = (days) => {
	return (futureTime(days*86400))
}


module.exports = async function(callback) {
	try {
		// Fetch accounts from wallet - these are unlocked
		const accounts = await web3.eth.getAccounts()

		// Fetch the deployed crowdfunder
		const crowdfunder = await Crowdfunder.deployed()
		console.log('Crowdfunder fetched', crowdfunder.address)

		// Fetch the deployed swap
		const swap = await Swap.deployed()
		console.log('Swap fetched', swap.address)

		// Deployer mints 10000 dai to give to each of the first three account
		const deployer = accounts[0]
		let amount = daiToken(10000)
		for(let i = 0; i < 3; i++) {
			await dai.faucet(accounts[i], amount, {from: deployer})
			console.log(`${deployer} mints ${amount} dai to give to ${accounts[i]}`)
		}
		// Set up exchange users
		const user1 = accounts[0]
		const user2 = accounts[1]
		const user3 = accounts[2]

		/////////////////////////////////////////////////////////////
		// Seed Open Projects
		//
		const name = "Sample Name"
		const imgHash = 'abc123'
		let result
		let projectId
		// User 1 makes project 
		let description = "I need 100 dai to help fund my new album that I hope to release next month"
		amount = 100
		result = await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), futureTime(THIRTY_DAYS), {from: user1 })
		console.log(`Made project from ${user1}`)

		// User 2 approves dai and contributes funds to user 1's project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 40
		await dai.approve(projectAddress, daiToken(amount), { from: user2 })
		console.log(`Approved ${amount} dai from ${user2}`)
		await crowdfunder.contribute(projectId, daiToken(amount), { from: user2 })
		console.log(`${user2} contributes ${amount} dai to ${user1} project`)

		await wait(1)

		// User 3 approves dai and contributes funds to user 1's project
		amount = 30
		await dai.approve(projectAddress, daiToken(amount) , { from: user3 })
		console.log(`Approved ${amount} dai from ${user3}`)
		await crowdfunder.contribute(projectId, daiToken(amount), { from: user3 })
		console.log(`${user3} contributes ${amount} dai to ${user1} project`)

		// User 2 makes project 
		description = "I need 150 dai to help fund my new album that I hope to release next month"
		amount = 150
		result = await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), futureTime(THIRTY_DAYS), { from: user2 })
		console.log(`Made project from ${user2}`)

		// User 3 approves dai and contributes funds to user 2's project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 50
		await dai.approve(projectAddress, daiToken(amount), { from: user3 })
		console.log(`Approved ${amount} dai from ${user3}`)
		await crowdfunder.contribute(projectId, daiToken(amount), { from: user3 })
		console.log(`${user3} contributes ${amount} dai to ${user2} project`)

		await wait(1)

		// User 1 approves dai and contributes funds to user 2's project
		amount = 40
		await dai.approve(projectAddress, daiToken(amount), { from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute(projectId, daiToken(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user2} project`)

		// User 3 makes project 
		description = "I need 200 dai to help fund my new album that I hope to release next month"
		amount = 200
		result = await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), futureTime(THIRTY_DAYS), { from: user3 })
		console.log(`Made project from ${user3}`)

		// User 1 approves dai and contributes funds to user 3's project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 70
		await dai.approve(projectAddress, daiToken(amount), { from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute(projectId, daiToken(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user3} project`)

		await wait(1)

		// User 2 approves dai and contributes funds to user 3's project
		amount = 60
		await dai.approve(projectAddress, daiToken(amount), { from: user2 })
		console.log(`Approved ${amount} dai from ${user2}`)
		await crowdfunder.contribute(projectId, daiToken(amount), { from: user2 })
		console.log(`${user2} contributes ${amount} dai to ${user3} project`)

		/////////////////////////////////////////////////////////////
		// Seed Failed Projects
		//

		// User 3 makes project 
		description = "I need 300 dai to help fund my new album that I hope to release today"
		amount = 300
		result = await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), futureTime(30), { from: user3 })
		console.log(`Made project from ${user3}`)

		// User 1 approves dai and contributes funds to user 3's project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 120
		await dai.approve(projectAddress, daiToken(amount), { from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute(projectId, daiToken(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user3} project`)


		// User 2 makes project
		description = "I need 50 dai to help fund my new album that I hope to release today"
		amount = 50
		await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), futureTime(30), { from: user2 })
		console.log(`Made project from ${user2}`)


		await wait(1)

		// User 1 makes project 
		description = "I need 200 dai to help fund my new album that I hope to release today"
		amount = 200
		result = await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), futureTime(20), { from: user1 })
		console.log(`Made project from ${user1}`)

		// User 2 approves dai and contributes funds to user 1's project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 50
		await dai.approve(projectAddress, daiToken(amount), { from: user2 })
		console.log(`Approved ${amount} dai from ${user2}`)
		await crowdfunder.contribute(projectId, daiToken(amount), { from: user2 })
		console.log(`${user2} contributes ${amount} dai to ${user1} project`)

		await wait(1)

		// User 3 approves dai and contributes funds to user 1's project
		amount = 60
		await dai.approve(projectAddress, daiToken(amount), { from: user3 })
		console.log(`Approved ${amount} dai from ${user3}`)
		await crowdfunder.contribute(projectId, daiToken(amount), { from: user3 })
		console.log(`${user3} contributes ${amount} dai to ${user1} project`)

		await wait(20)



		/////////////////////////////////////////////////////////////
		// Seed a Cancelled Project
		//	

		// User 3 makes project 
		description = "I need 250 dai to help fund my new album that I hope to release in two weeks"
		amount = 250
		result = await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), futureTime(FOURTEEN_DAYS), { from: user3 })
		console.log(`Made project from ${user3}`)

		// User 3 cancels their project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		await crowdfunder.cancel(projectId, { from: user3 })
		console.log(`${user3} cancels their project ID: 7`)


		// User 1 makes project 
		description = "I need 230 dai to help fund my new album that I hope to release today"
		amount = 230
		result = await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), futureTime(FOURTEEN_DAYS), { from: user1 })
		console.log(`Made project from ${user1}`)

		// User 2 approves dai and contributes funds to user 1's project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 50
		await dai.approve(projectAddress, daiToken(amount), { from: user2 })
		console.log(`Approved ${amount} dai from ${user2}`)
		await crowdfunder.contribute(projectId, daiToken(amount), { from: user2 })
		console.log(`${user2} contributes ${amount} dai to ${user1} project`)

		// User 1 cancels their project
		await crowdfunder.cancel(projectId, { from: user1 })
		console.log(`${user1} cancels their project ID: 8`)

		// User 2 gets their refund after project number 8 gets cancelled
		await crowdfunder.claimRefund(projectId, { from: user2 })
		console.log(`${user2} gets their contributions to ${user1} cancelled projects refunded`)

		/////////////////////////////////////////////////////////////
		// Seed a Fully Funded Open Project
		//

		// User 2 makes project
		description = "I need 40 dai to help fund my new album that I hope to release in two weeks"
		amount = 40
		result = await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), futureTime(FOURTEEN_DAYS), { from: user2 })
		console.log(`Made project from ${user2}`)

		// User 1 approves dai and contributes enough funds to user 2's project to fully fund it
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 40
		await dai.approve(projectAddress, daiToken(amount), { from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute(projectId, daiToken(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user2} project`)

		/////////////////////////////////////////////////////////////
		// Seed a Pending Transfer Project
		//	

		// User 2 makes project
		description = "I need 20 dai to help fund my new album that I hope to release in two weeks"
		amount = 20
		result = await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), futureTime(15), { from: user2 })
		console.log(`Made project from ${user2}`)

		// User 1 approves dai and contributes enough funds to user 2's project to fully fund it
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 20
		await dai.approve(projectAddress, daiToken(amount), { from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute(projectId, daiToken(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user2} project`)

	}	
	catch(error){
		console.log(error)
	}
	callback()
}