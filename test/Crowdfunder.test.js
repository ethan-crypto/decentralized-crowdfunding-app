import { expect } from 'chai'
import { EVM_REVERT, futureTime, mainnetDai, mainnetWeth, toWei, wait } from './helpers'
const { expectRevert, time } = require('@openzeppelin/test-helpers')
const Crowdfunder = artifacts.require("Crowdfunder")
const Project = artifacts.require("Project")
const IERC20 = artifacts.require("IERC20")
const Swap = artifacts.require("Swap")

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Crowdfunder', ([deployer, feeAccount, user1, user2, user3]) => {
	const feePercent = 10
	const description = 'Sample description'
	const name = 'Sample Name'
	const imgHash = 'abc123'
	const THIRTY_DAYS = +time.duration.days(30)
	const SIXTY_DAYS = +time.duration.days(60)
	let crowdfunder, dai, swap
	let timeIncrease = 0
	beforeEach(async() => {
		swap = await Swap.new(mainnetDai, mainnetWeth)

		swap.convertEthToExactDai(toWei(100),futureTime(15+timeIncrease), {value: toWei(0.3), from: user1});
		swap.convertEthToExactDai(toWei(100),futureTime(15+timeIncrease), {value: toWei(0.3), from: user2});
		swap.convertEthToExactDai(toWei(100),futureTime(15+timeIncrease), {value: toWei(0.3), from: user3});
		
		dai = new web3.eth.Contract(IERC20.abi, mainnetDai)
		crowdfunder = await Crowdfunder.new(mainnetDai, feeAccount, feePercent)
	})
	
	describe('deployment', () => {
		it('tracks the feeAccount', async () => {
			const result = await crowdfunder.feeAccount()
			result.should.equal(feeAccount)
		})
		it('tracks the feePercent', async () => {
			const result = await crowdfunder.feePercent()
			result.toString().should.equal(feePercent.toString())
		})
		it('tracks the dai address', async () => {
			const result = await crowdfunder.dai()
			result.toString().should.equal(mainnetDai.toString())
		})
	})

	describe('fallback', () => {
		it('reverts when Ether is sent', () => {
		  crowdfunder.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT)
		})
	})

	describe('making projects', () => {
		let result
		let timeGoal 	
		describe('success', () => {
			beforeEach(async() => {
				timeGoal = futureTime(THIRTY_DAYS)
				result = await crowdfunder.makeProject(name, description, imgHash, toWei(10), timeGoal, { from: user1 })
				
			})

			it('tracks the newly created project contract', async () => {
				const projectCount = await crowdfunder.projectCount()
				projectCount.toString().should.equal('1')
				const projectAddress = await crowdfunder.projects('1')
				const project = new web3.eth.Contract(Project.abi, projectAddress)
				const name = await project.methods.name().call()
				name.should.equal(name, 'name is incorrect')
				const description = await project.methods.description().call()
				description.should.equal(description, 'description is incorrect')
				const imgHash = await project.methods.imgHash().call()
				imgHash.should.equal(imgHash, 'image hash is incorrect')
				const creator = await project.methods.creator().call()
				creator.should.equal(user1, 'creator is incorrect')
				const fundGoal = await project.methods.fundGoal().call()
				fundGoal.toString().should.equal(toWei(10).toString(), 'fundGoal is incorrect')
				const timeGoal = await project.methods.timeGoal().call()
				timeGoal.toString().should.equal(timeGoal.toString(), 'timeGoal is incorrect')
				const timestamp = await project.methods.timestamp().call()
				timestamp.toString().length.should.be.at.least(1, 'timestamp is not present')
				const daiAddress = await project.methods.dai().call()	
				daiAddress.should.equal(mainnetDai, 'dai address is incorrect')		
			})
			it('emits a "ProjectMade" event', () => {
				const log = result.logs[0]
				log.event.should.eq('ProjectMade')
				const event = log.args
				event.id.toString().should.equal('1', 'id is incorrect')
				event.name.should.equal(name, 'name is incorrect')
				event.description.should.equal(description, 'description is incorrect')
				event.imgHash.should.equal(imgHash, 'image hash is incorrect')
				event.creator.should.equal(user1, 'user is incorrect')
				event.fundGoal.toString().should.equal(toWei(10).toString(), 'fundGoal is incorrect')
				event.timeGoal.toString().should.equal(timeGoal.toString(), 'timeGoal is incorrect')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is not present')
			})
		})
		describe('failure', () => {
			timeGoal = futureTime(THIRTY_DAYS)
			it('rejects non existent name, description, image hash and time goals that are greater than 60 days or equal to zero', () => {
				expectRevert(
					crowdfunder.makeProject(name, description, imgHash, toWei(10), 0, { from: user1}), 
					'Error, time goal must exist in the future'
				);
				expectRevert(
					crowdfunder.makeProject(name, description, imgHash, toWei(10), futureTime(SIXTY_DAYS+1), { from: user1}), 
					'Error, time goal must be less than 60 days'
				);
				expectRevert(
					crowdfunder.makeProject('', description, imgHash, toWei(10), timeGoal, { from: user1}), 
					'Error, name must exist'
				);
				expectRevert(
					crowdfunder.makeProject(name, '', imgHash, toWei(10), timeGoal, { from: user1}), 
					'Error, description must exist'
				);
				expectRevert(
					crowdfunder.makeProject(name, description, '', toWei(10), timeGoal, { from: user1}), 
					'Error, image hash must exist'
				);
			})
		})
	})

	describe('funding projects', () => {
		let result, timeGoal, projectAddress, project, user2DaiBalance, user3DaiBalance
		beforeEach(async () => {
			// user 1 and user 2 starting Dai balance
			user2DaiBalance = await dai.methods.balanceOf(user2).call()
			user3DaiBalance = await dai.methods.balanceOf(user3).call()
			
			timeGoal = futureTime(THIRTY_DAYS + timeIncrease)
			// user1 makes project
			await crowdfunder.makeProject(name, description, imgHash, toWei(10), timeGoal , {from: user1})
			projectAddress = await crowdfunder.projects('1')
			// approve project to spend user2 daiToken
			await dai.methods.approve(projectAddress, toWei(1)).send({from: user2})
			// user2 funds project
			await crowdfunder.contribute('1', toWei(1), {from: user2})
			// approve crowdfunder to spend user3 daiToken
			await dai.methods.approve(projectAddress, toWei(2)).send({from: user3})
			//user3 funds project
			result = await crowdfunder.contribute('1', toWei(2), {from: user3})
		})
		describe('success', () => {
			let amount
			it('tracks supporter funds and total funds', async() => {
				let supporterFunds
				// Check user 2 token balance
				amount = await dai.methods.balanceOf(user2).call()
				amount.toString().should.equal((+user2DaiBalance.toString()- +toWei(1).toString()).toString(), "user2 dai balance is incorrect")
				// Check user 3 token balance
				amount = await dai.methods.balanceOf(user3).call()
				amount.toString().should.equal((+user3DaiBalance.toString()- +toWei(2).toString()).toString(), "user3 dai balance is incorrect")
				// Check project token balance and raised funds
				amount = await dai.methods.balanceOf(projectAddress).call()
				amount.toString().should.equal(toWei(3).toString())
				project = new web3.eth.Contract(Project.abi, projectAddress)
				const raisedFunds = await project.methods.raisedFunds().call()
				raisedFunds.toString().should.equal(toWei(3).toString())
				// Check supporter funds on project
				supporterFunds = await project.methods.supporterFunds(user2).call()
				supporterFunds.toString().should.equal(toWei(1).toString(), 'user2 supporter funds is incorrect')
				supporterFunds = await project.methods.supporterFunds(user3).call()
				supporterFunds.toString().should.equal(toWei(2).toString(), 'user3 supporter funds is incorrect')			
			})
			it('emits contribution event', () => {
				const log = result.logs[0]
				log.event.should.eq('Contribution')
				const event = log.args
				event.id.toString().should.equal('1', 'id is incorrect')
				event.supporter.should.equal(user3, 'supporter is incorrect')
				event.newSupporter.should.equal(true, 'supporter count is incorrect')
				event.raisedFunds.toString().should.equal(toWei(3).toString(), 'raisedFunds is incorrect')
				event.fundAmount.toString().should.equal(toWei(2).toString(), 'fundAmount is incorrect')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
			})
		})
		describe('failure', () => {
			it('rejects funds when project time goal passed', async () => {
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease = THIRTY_DAYS + 1
				expectRevert(
					crowdfunder.contribute('1', toWei(3), {from: user2}),
					'Error, project must be open' 
				);
			})
			it('rejects invalid project ids', () => {
				expectRevert(
					crowdfunder.contribute('9999', toWei(1), {from: user2}),
					'revert'	
				);
			})
			it('rejects when creator tries to add funds to their own project', () => {
				expectRevert(
					crowdfunder.contribute('1', toWei(1), {from: user1}),
					'Error, creators are not allowed to add funds to their own projects'
				);
			})
			it('rejects funds from projects that have been canceled', async() => {
				// user1 cancels their project
				await crowdfunder.cancel('1', {from: user1})
				// user2 tries to fund that project
				expectRevert(
					crowdfunder.contribute('1', toWei(5), {from: user2}),
					'Error, project cancelled'
				);
			})
		})
	})

	describe('disbursing collected funds', () => {
		let result, timeGoal, projectAddress, user1DaiBalance, feeAccountDaiBalance
		beforeEach(async() => {
			// Check user1 and fee account starting Dai balance
			user1DaiBalance = await dai.methods.balanceOf(user1).call()
			feeAccountDaiBalance = await dai.methods.balanceOf(feeAccount).call()

			timeGoal = futureTime(THIRTY_DAYS + timeIncrease)
			// user1 makes project
			await crowdfunder.makeProject(name, description, imgHash, toWei(10), timeGoal, {from: user1})
			//approve project to spend 10 of user2's dai
			projectAddress = await crowdfunder.projects('1')
			await dai.methods.approve(projectAddress, toWei(10)).send({from: user2})
		})
		describe('success', () => {
			it('disburses raised funds to creator with fee applied and fee amount to fee account', async() => {
				let newBalance
				// user2 fully funds user1's first and second project
				await crowdfunder.contribute('1', toWei(10), {from: user2})
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				// user1 calls disburse function once for both of their projects
				result = await crowdfunder.disburse('1', {from: user1})
				// check user 1 dai balance
				newBalance = await dai.methods.balanceOf(user1).call()
				console.log(`START: ${user1DaiBalance} NEW: ${newBalance}`)
				expect(+newBalance.toString() - +user1DaiBalance.toString()).to.eq(+toWei(9).toString(),'user1 dai balance is incorrect' )
				//balance.toString().should.equal((+user1DaiBalance.toString()+ +toWei(9).toString()).toString(), )
				// check feeAccount dai balance
				newBalance = await dai.methods.balanceOf(feeAccount).call()
				newBalance.toString().should.equal((+feeAccountDaiBalance.toString()+ +toWei(1)).toString(), 'feeAccount dai balance is incorrect')
				// check first project dai balance
				newBalance = await dai.methods.balanceOf(projectAddress).call()
				newBalance.toString().should.equal('0', 'project dai balance is incorrect')								
			})
			it('emits Disburse events', () => {
				// disburse event for user1's project
				const log = result.logs[0]
				log.event.should.eq('Disburse')
				const event = log.args
				event.id.toString().should.equal('1', 'id is incorrect')
				event.creator.should.equal(user1, 'creator is incorrect')
				event.disburseAmount.toString().should.equal(toWei(9).toString(), 'disburse amount is incorrect')
				event.feeAmount.toString().should.equal(toWei(1).toString(), 'fee amount is incorrect')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is not present')
			})
		})
		describe('failure', () => {
			it('rejects when project is still open', async () => {
				// user2 fully funds project
				await crowdfunder.contribute('1', toWei(10), {from: user2})
				// user1 calls disburse function on their project before waiting until the project has ended
				expectRevert(
					crowdfunder.disburse('1', {from: user1}),
					'Error, project still open'
				);
			})
			it('rejects when project did not reach its funding goal', async() => {
				// user2 contributes 9 dai to the project, 1 shy of its funding goal
				await crowdfunder.contribute('1', toWei(9), {from: user2})
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				expectRevert(
					crowdfunder.disburse('1', {from: user1}),
					'Error, project not fullyFunded'
				);
			})
			it('rejects unauthorized disburses', async() => {
				// user2 fully funds project
				await crowdfunder.contribute('1', toWei(10), {from: user2})
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				expectRevert(
					crowdfunder.disburse('1', {from: user2}),
					'Error, only creator can disburse collected project funds'
				);
			})
			it('rejects when project funds have already been disbursed', async() => {
				// user2 fully funds project
				await crowdfunder.contribute('1', toWei(10), {from: user2})
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				// user1 successfully transfers funds from first project
				await crowdfunder.disburse('1', {from: user1})
				expectRevert(
					crowdfunder.disburse('1', {from: user1}),
					'Error, project not fullyFunded'
				);
			})	
			it('rejects when project has been cancelled', async() => {
				// user2 fully funds first project
				await crowdfunder.contribute('1', toWei(10), {from: user2})
				// user1 cancels their project
				await crowdfunder.cancel('1', {from: user1})
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				expectRevert(
					crowdfunder.disburse('1', {from: user1}),
					'Error, project cancelled'
				);
			})	
		})
	})


	describe('refunds', () => {
		let timeGoal, projectAddress, project
		beforeEach(async() => {
			timeGoal = futureTime(THIRTY_DAYS + timeIncrease)
			//user1 makes project
			await crowdfunder.makeProject(name, description, imgHash, toWei(10), timeGoal , {from: user1})
			projectAddress = await crowdfunder.projects('1')
			// user2 contributes funds to user1s project
			await dai.methods.approve(projectAddress, toWei(7)).send({from: user2})
			await crowdfunder.contribute('1', toWei(5), {from: user2})
			// user3 contributes funds to user1s project 
			await dai.methods.approve(projectAddress, toWei(3)).send({from: user3})
			await crowdfunder.contribute('1', toWei(3), {from: user3})
		})
		describe('success', () => {
			let result, supporterFunds
			it('refunds supporter funds after project fails to meet funding deadline', async() => {
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				// user 2 calls refund function
				await crowdfunder.claimRefund('1', {from: user2})
				// sets user2 supporter funds for user1's project back to 0
				project = new web3.eth.Contract(Project.abi, projectAddress)
				supporterFunds = await project.methods.supporterFunds(user2).call()
				supporterFunds.toString().should.equal('0', 'user2 supporter funds is incorrect')				
				
			})
			it('refunds supporter funds after project has been cancelled', async() => {
				// user 1 cancels their project
				await crowdfunder.cancel('1', {from: user1})
				// user 3 calls refund function
				result = await crowdfunder.claimRefund('1', {from: user3})
				// sets user3 supporter funds for user1's project back to 0
				project = new web3.eth.Contract(Project.abi, projectAddress)
				supporterFunds = await project.methods.supporterFunds(user3).call()
				supporterFunds.toString().should.equal('0', 'user3 supporter funds is incorrect')
			})
			it('emits a refund event', async() => {
				//refund event for user3's contribution to user1's cancelled project
				const log = result.logs[0]
				log.event.should.eq('Refund')
				const event = log.args
				event.id.toString().should.equal('1', 'id is incorrect')
				event.supporter.should.equal(user3, 'supporter is incorrect')
				event.raisedFunds.toString().should.equal(toWei(5).toString(), 'raisedFunds is incorrect')
				event.refundAmount.toString().should.equal(toWei(3).toString(), 'refundAmount is incorrect')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
			})
		})
		describe('failure', () => {
			it('rejects refunds when project is still open', () => {
				// calls refund function before deadline passes
				expectRevert(
					crowdfunder.claimRefund('1', {from: user2}), 
					'Error, no refunds unless project has been cancelled or did not meet funding goal'
				);
			})
			it('rejects refunds when project reached funding goal by deadline', async() => {
				// user 2 adds enough funds for user1's first project to reach funding goal
				await crowdfunder.contribute('1', toWei(2), {from: user2})
				// increase time past funding deadline
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				// calls refund function after project meets funding goal in time
				expectRevert(
					crowdfunder.claimRefund('1', {from: user2}),
					'Error, no refunds unless project has been cancelled or did not meet funding goal'
				);
			})
		})
		
	})
	describe('cancelling projects', () => {
		let result, timeGoal, project
		beforeEach(async() => {
			timeGoal = futureTime(THIRTY_DAYS + timeIncrease)
			// user1 makes project
			await crowdfunder.makeProject(name, description, imgHash, toWei(10), timeGoal , {from: user1})
		})
		describe('success', () => {
			beforeEach(async() => {
				// user1 cancels project
				result = await crowdfunder.cancel('1', {from: user1})					
			})
			it('updates cancelled projects', async() => {
				const projectAddress = await crowdfunder.projects('1')
				project = new web3.eth.Contract(Project.abi, projectAddress)
				const projectCancelled = await project.methods.cancelled().call()
				projectCancelled.should.equal(true)
			})
			it('emits cancel event', () => {
				const log = result.logs[0]
				log.event.should.eq('Cancel')
				const event = log.args
				event.id.toString().should.equal('1', 'id is correct')
				event.creator.should.equal(user1, 'creator is correct')
				event.fundGoal.toString().should.equal(toWei(10).toString(), 'fundGoal is correct')
				event.timeGoal.toString().should.equal(timeGoal.toString(), 'timeGoal is correct')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')				
			})
		})
		describe('failure', () => {
			it('rejects when project has ended', async() => {
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				expectRevert(
					crowdfunder.cancel('1', {from: user1}),
					'Error, project must be open'
				);
			})
			it('rejects invalid project ids', () => {
				const invalidProjectId = '99999'
				expectRevert(
					crowdfunder.cancel(invalidProjectId, {from: user1}),
					'revert'
				);
			})
			it('rejects unauthorized cancelations', async() => {
				expectRevert(
					crowdfunder.cancel('1', {from: user2}),
					'Error, only creator can cancel their project'
				);
				await wait(1)
			})
		})
	})
})
