const { time } = require('@openzeppelin/test-helpers')
const Swap = artifacts.require("Swap");
const Crowdfunder = artifacts.require("Crowdfunder");
//Utils
const futureTime = (seconds) => {
	return (+Math.floor(new Date().getTime()/1000.0) + +seconds)
} 
const toWei = (num) => web3.utils.toWei(num.toString(), "ether")
    
const wait = (seconds) => {
	const milliseconds = seconds * 1000
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}
const mainnetDai = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const THIRTY_DAYS = time.duration.days(30)
const FOURTEEN_DAYS = time.duration.days(14)

// spliced ERC20 ABI
const splicedABI = [
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

module.exports = async function (callback) {
	try {
		// Fetch accounts from wallet - these are unlocked
		const accounts = await web3.eth.getAccounts()

		// Fetch the deployed crowdfunder
		const crowdfunder = await Crowdfunder.deployed()
		console.log('Crowdfunder fetched', crowdfunder.address)

		// Fetch the deployed swap
		const swap = await Swap.deployed()
		console.log('Swap fetched', swap.address)

		//Fetch web3 instance of deployed dai
		const dai = new web3.eth.Contract(splicedABI, mainnetDai)

		await wait(1)
		// First three accounts use the swap contract to convert a certain amount of Eth into 1000 Dai each
		for (let i = 0; i < 3; i++) {
			await swap.convertEthToExactDai(toWei(1000), futureTime(15), { value: toWei(0.4), from: accounts[i] })
			console.log(`${accounts[i]} swaps a certain amount of eth for exactly 1000 dai`)
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
		result = await crowdfunder.makeProject(name, description, imgHash, toWei(amount), futureTime(THIRTY_DAYS), { from: user1 })
		console.log(`Made project from ${user1}`)

		// User 2 approves dai and contributes funds to user 1's project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 40
		await dai.methods.approve(projectAddress, toWei(amount)).send({ from: user2 })
		console.log(`Approved ${amount} dai from ${user2}`)
		await crowdfunder.contribute(projectId, toWei(amount), { from: user2 })
		console.log(`${user2} contributes ${amount} dai to ${user1} project`)

		await wait(1)

		// User 3 approves dai and contributes funds to user 1's project
		amount = 30
		await dai.methods.approve(projectAddress, toWei(amount)).send({ from: user3 })
		console.log(`Approved ${amount} dai from ${user3}`)
		await crowdfunder.contribute(projectId, toWei(amount), { from: user3 })
		console.log(`${user3} contributes ${amount} dai to ${user1} project`)

		// User 2 makes project 
		description = "I need 150 dai to help fund my new album that I hope to release next month"
		amount = 150
		result = await crowdfunder.makeProject(name, description, imgHash, toWei(amount), futureTime(THIRTY_DAYS), { from: user2 })
		console.log(`Made project from ${user2}`)

		// User 3 approves dai and contributes funds to user 2's project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 50
		await dai.methods.approve(projectAddress, toWei(amount)).send({ from: user3 })
		console.log(`Approved ${amount} dai from ${user3}`)
		await crowdfunder.contribute(projectId, toWei(amount), { from: user3 })
		console.log(`${user3} contributes ${amount} dai to ${user2} project`)

		await wait(1)

		// User 1 approves dai and contributes funds to user 2's project
		amount = 40
		await dai.methods.approve(projectAddress, toWei(amount)).send({ from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute(projectId, toWei(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user2} project`)

		// User 3 makes project 
		description = "I need 200 dai to help fund my new album that I hope to release next month"
		amount = 200
		result = await crowdfunder.makeProject(name, description, imgHash, toWei(amount), futureTime(THIRTY_DAYS), { from: user3 })
		console.log(`Made project from ${user3}`)

		// User 1 approves dai and contributes funds to user 3's project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 70
		await dai.methods.approve(projectAddress, toWei(amount)).send({ from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute(projectId, toWei(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user3} project`)

		await wait(1)

		// User 2 approves dai and contributes funds to user 3's project
		amount = 60
		await dai.methods.approve(projectAddress, toWei(amount)).send({ from: user2 })
		console.log(`Approved ${amount} dai from ${user2}`)
		await crowdfunder.contribute(projectId, toWei(amount), { from: user2 })
		console.log(`${user2} contributes ${amount} dai to ${user3} project`)

		/////////////////////////////////////////////////////////////
		// Seed Failed Projects
		//

		// User 3 makes project 
		description = "I need 300 dai to help fund my new album that I hope to release today"
		amount = 300
		result = await crowdfunder.makeProject(name, description, imgHash, toWei(amount), futureTime(30), { from: user3 })
		console.log(`Made project from ${user3}`)

		// User 1 approves dai and contributes funds to user 3's project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 120
		await dai.methods.approve(projectAddress, toWei(amount)).send({ from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute(projectId, toWei(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user3} project`)


		// User 2 makes project
		description = "I need 50 dai to help fund my new album that I hope to release today"
		amount = 50
		await crowdfunder.makeProject(name, description, imgHash, toWei(amount), futureTime(30), { from: user2 })
		console.log(`Made project from ${user2}`)


		await wait(1)

		// User 1 makes project 
		description = "I need 200 dai to help fund my new album that I hope to release today"
		amount = 200
		result = await crowdfunder.makeProject(name, description, imgHash, toWei(amount), futureTime(20), { from: user1 })
		console.log(`Made project from ${user1}`)

		// User 2 approves dai and contributes funds to user 1's project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 50
		await dai.methods.approve(projectAddress, toWei(amount)).send({ from: user2 })
		console.log(`Approved ${amount} dai from ${user2}`)
		await crowdfunder.contribute(projectId, toWei(amount), { from: user2 })
		console.log(`${user2} contributes ${amount} dai to ${user1} project`)

		await wait(1)

		// User 3 approves dai and contributes funds to user 1's project
		amount = 60
		await dai.methods.approve(projectAddress, toWei(amount)).send({ from: user3 })
		console.log(`Approved ${amount} dai from ${user3}`)
		await crowdfunder.contribute(projectId, toWei(amount), { from: user3 })
		console.log(`${user3} contributes ${amount} dai to ${user1} project`)

		await wait(20)



		/////////////////////////////////////////////////////////////
		// Seed a Cancelled Project
		//	

		// User 3 makes project 
		description = "I need 250 dai to help fund my new album that I hope to release in two weeks"
		amount = 250
		result = await crowdfunder.makeProject(name, description, imgHash, toWei(amount), futureTime(FOURTEEN_DAYS), { from: user3 })
		console.log(`Made project from ${user3}`)

		// User 3 cancels their project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		await crowdfunder.cancel(projectId, { from: user3 })
		console.log(`${user3} cancels their project ID: 7`)


		// User 1 makes project 
		description = "I need 230 dai to help fund my new album that I hope to release today"
		amount = 230
		result = await crowdfunder.makeProject(name, description, imgHash, toWei(amount), futureTime(FOURTEEN_DAYS), { from: user1 })
		console.log(`Made project from ${user1}`)

		// User 2 approves dai and contributes funds to user 1's project
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 50
		await dai.methods.approve(projectAddress, toWei(amount)).send({ from: user2 })
		console.log(`Approved ${amount} dai from ${user2}`)
		await crowdfunder.contribute(projectId, toWei(amount), { from: user2 })
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
		result = await crowdfunder.makeProject(name, description, imgHash, toWei(amount), futureTime(FOURTEEN_DAYS), { from: user2 })
		console.log(`Made project from ${user2}`)

		// User 1 approves dai and contributes enough funds to user 2's project to fully fund it
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 40
		await dai.methods.approve(projectAddress, toWei(amount)).send({ from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute(projectId, toWei(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user2} project`)

		/////////////////////////////////////////////////////////////
		// Seed a Pending Transfer Project
		//	

		// User 2 makes project
		description = "I need 20 dai to help fund my new album that I hope to release in two weeks"
		amount = 20
		result = await crowdfunder.makeProject(name, description, imgHash, toWei(amount), futureTime(15), { from: user2 })
		console.log(`Made project from ${user2}`)

		// User 1 approves dai and contributes enough funds to user 2's project to fully fund it
		projectId = result.logs[0].args.id
		projectAddress = await crowdfunder.projects(projectId)
		amount = 20
		await dai.methods.approve(projectAddress, toWei(amount)).send({ from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute(projectId, toWei(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user2} project`)

	}
	catch (error) {
		console.log(error)
	}
	callback()
}