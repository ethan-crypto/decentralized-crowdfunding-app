const { time } = require('@openzeppelin/test-helpers')
const Dai = artifacts.require("Dai");
const Crowdfunder = artifacts.require("Crowdfunder");
// Utils
const daiToken = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}

const THIRTY_DAYS = time.duration.days(30)
const FOURTEEN_DAYS = time.duration.days(14)
const futureTime = (seconds) => {
  return (Math.floor(new Date().getTime()/1000.0) + seconds)
} 

const daysAhead = (days) => {
	return (futureTime(days*86400))
}

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

module.exports = async function(callback) {
	try {
		// Fetch accounts from wallet - these are unlocked
		const accounts = await web3.eth.getAccounts()

		// Fetch the deployed crowdfunder
		const crowdfunder = await Crowdfunder.deployed()
		console.log('Crowdfunder fetched', crowdfunder.address)

		// Fetch the deployed dai
		const dai = await Dai.deployed()
		console.log('Dai fetched', dai.address)

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
		const fee = 1.1
		// User 1 makes project 
		let description = "I need 100 dai to help fund my new album that I hope to release next month"
		amount = 100
		await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), THIRTY_DAYS, {from: user1 })
		console.log(`Made project from ${user1}`)

		// User 2 approves dai and contributes funds to user 1's project
		amount = 40
		await dai.approve(crowdfunder.address, daiToken(amount*fee), { from: user2 })
		console.log(`Approved ${amount} dai from ${user2}`)
		await crowdfunder.contribute('1', daiToken(amount), { from: user2 })
		console.log(`${user2} contributes ${amount} dai to ${user1} project`)

		await wait(1)

		// User 3 approves dai and contributes funds to user 1's project
		amount = 30
		await dai.approve(crowdfunder.address, daiToken(amount*fee) , { from: user3 })
		console.log(`Approved ${amount} dai from ${user3}`)
		await crowdfunder.contribute('1', daiToken(amount), { from: user3 })
		console.log(`${user3} contributes ${amount} dai to ${user1} project`)

		// User 2 makes project 
		description = "I need 150 dai to help fund my new album that I hope to release next month"
		amount = 150
		await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), THIRTY_DAYS, { from: user2 })
		console.log(`Made project from ${user2}`)

		// User 3 approves dai and contributes funds to user 2's project
		amount = 50
		await dai.approve(crowdfunder.address, daiToken(amount*fee), { from: user3 })
		console.log(`Approved ${amount} dai from ${user3}`)
		await crowdfunder.contribute('2', daiToken(amount), { from: user3 })
		console.log(`${user3} contributes ${amount} dai to ${user2} project`)

		await wait(1)

		// User 1 approves dai and contributes funds to user 2's project
		amount = 40
		await dai.approve(crowdfunder.address, daiToken(amount*fee), { from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute('2', daiToken(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user2} project`)

		// User 3 makes project 
		description = "I need 200 dai to help fund my new album that I hope to release next month"
		amount = 200
		await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), THIRTY_DAYS, { from: user3 })
		console.log(`Made project from ${user3}`)

		// User 1 approves dai and contributes funds to user 3's project
		amount = 70
		await dai.approve(crowdfunder.address, daiToken(amount*fee), { from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute('3', daiToken(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user3} project`)

		await wait(1)

		// User 2 approves dai and contributes funds to user 3's project
		amount = 60
		await dai.approve(crowdfunder.address, daiToken(amount*fee), { from: user2 })
		console.log(`Approved ${amount} dai from ${user2}`)
		await crowdfunder.contribute('3', daiToken(amount), { from: user2 })
		console.log(`${user2} contributes ${amount} dai to ${user3} project`)

		/////////////////////////////////////////////////////////////
		// Seed Failed Projects
		//

		// User 3 makes project 
		description = "I need 300 dai to help fund my new album that I hope to release today"
		amount = 300
		await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), 30, { from: user3 })
		console.log(`Made project from ${user3}`)

		// User 1 approves dai and contributes funds to user 3's project
		amount = 120
		await dai.approve(crowdfunder.address, daiToken(amount*fee), { from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute('4', daiToken(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user3} project`)


		// User 2 makes project
		description = "I need 50 dai to help fund my new album that I hope to release today"
		amount = 50
		await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), 30, { from: user2 })
		console.log(`Made project from ${user2}`)


		await wait(1)

		// User 1 makes project 
		description = "I need 200 dai to help fund my new album that I hope to release today"
		amount = 200
		await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), 20, { from: user1 })
		console.log(`Made project from ${user1}`)

		// User 2 approves dai and contributes funds to user 1's project
		amount = 50
		await dai.approve(crowdfunder.address, daiToken(amount*fee), { from: user2 })
		console.log(`Approved ${amount} dai from ${user2}`)
		await crowdfunder.contribute('6', daiToken(amount), { from: user2 })
		console.log(`${user2} contributes ${amount} dai to ${user1} project`)

		await wait(1)

		// User 3 approves dai and contributes funds to user 1's project
		amount = 60
		await dai.approve(crowdfunder.address, daiToken(amount*fee), { from: user3 })
		console.log(`Approved ${amount} dai from ${user3}`)
		await crowdfunder.contribute('6', daiToken(amount), { from: user3 })
		console.log(`${user3} contributes ${amount} dai to ${user1} project`)

		await wait(20)

		// User 2 gets their refund after user 1's project fails to meet funding goal in time
		await crowdfunder.refund('6', { from: user2 })
		console.log(`${user2} gets their contribution to ${user1} failed project refunded`)


		/////////////////////////////////////////////////////////////
		// Seed a Cancelled Project
		//	

		// User 3 makes project 
		description = "I need 250 dai to help fund my new album that I hope to release in two weeks"
		amount = 250
		await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), FOURTEEN_DAYS, { from: user3 })
		console.log(`Made project from ${user3}`)

		// User 3 cancels their project
		await crowdfunder.cancelProject('7', { from: user3 })
		console.log(`${user3} cancels their project ID: 7`)


		// User 1 makes project 
		description = "I need 230 dai to help fund my new album that I hope to release today"
		amount = 230
		await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), FOURTEEN_DAYS, { from: user1 })
		console.log(`Made project from ${user1}`)

		// User 2 approves dai and contributes funds to user 1's project
		amount = 50
		await dai.approve(crowdfunder.address, daiToken(amount*fee), { from: user2 })
		console.log(`Approved ${amount} dai from ${user2}`)
		await crowdfunder.contribute('8', daiToken(amount), { from: user2 })
		console.log(`${user2} contributes ${amount} dai to ${user1} project`)

		// User 1 cancels their project
		await crowdfunder.cancelProject('8', { from: user1 })
		console.log(`${user1} cancels their project ID: 8`)

		// User 2 gets their refund after user 1's project fails to meet funding goal in time
		await crowdfunder.refund('8', { from: user2 })
		console.log(`${user2} gets their contribution to ${user1} cancelled project refunded`)

		/////////////////////////////////////////////////////////////
		// Seed a Fully Funded Open Project
		//

		// User 2 makes project
		description = "I need 40 dai to help fund my new album that I hope to release in two weeks"
		amount = 40
		await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), FOURTEEN_DAYS, { from: user2 })
		console.log(`Made project from ${user2}`)

		// User 1 approves dai and contributes enough funds to user 2's project to fully fund it
		amount = 40
		await dai.approve(crowdfunder.address, daiToken(amount*fee), { from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute('9', daiToken(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user2} project`)

		/////////////////////////////////////////////////////////////
		// Seed a Pending Transfer Project
		//	

		// User 2 makes project
		description = "I need 20 dai to help fund my new album that I hope to release in two weeks"
		amount = 20
		await crowdfunder.makeProject(name, description, imgHash, daiToken(amount), 15, { from: user2 })
		console.log(`Made project from ${user2}`)

		// User 1 approves dai and contributes enough funds to user 2's project to fully fund it
		amount = 20
		await dai.approve(crowdfunder.address, daiToken(amount*fee), { from: user1 })
		console.log(`Approved ${amount} dai from ${user1}`)
		await crowdfunder.contribute('10', daiToken(amount), { from: user1 })
		console.log(`${user1} contributes ${amount} dai to ${user2} project`)

	}	
	catch(error){
		console.log(error)
	}
	callback()
}