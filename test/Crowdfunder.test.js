import Web3 from 'web3'	
import { daiToken, EVM_REVERT, futureTime} from './helpers'
const { expectRevert, constants, time } = require('@openzeppelin/test-helpers')
const Crowdfunder = artifacts.require("Crowdfunder")
const Dai = artifacts.require("Dai")


require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Crowdfunder', ([deployer, feeAccount, user1, user2, user3]) => {
	const feePercent = 10
	const description = 'Sample description'
	const name = 'Sample Name'
	const imgHash = 'abc123'
	const THIRTY_DAYS = time.duration.days(30)
	const SIXTY_DAYS = time.duration.days(60)
	let crowdfunder, dai
	beforeEach(async() => {
		dai = await Dai.new()

		dai.faucet(user1, daiToken(100), {from: deployer});
		dai.faucet(user2, daiToken(100), {from: deployer});
		dai.faucet(user3, daiToken(100), {from: deployer});

		crowdfunder = await Crowdfunder.new(dai.address, feeAccount, feePercent)
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
	})

	describe('fallback', () => {
		it('reverts when Ether is sent', () => {
		  crowdfunder.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT)
		})
	})

	describe('making projects', () => {
		let result
		describe('success', () => {
			beforeEach(async() => {
				result = await crowdfunder.makeProject(name, description, imgHash, daiToken(10), THIRTY_DAYS, { from: user1 })
			})

			it('tracks the newly created project', async () => {
				const projectCount = await crowdfunder.projectCount()
				projectCount.toString().should.equal('1')
				const project = await crowdfunder.projects('1')
				project.name.should.equal(name, 'name is correct')
				project.description.should.equal(description, 'description is correct')
				project.imgHash.should.equal(imgHash, 'image hash is correct')
				project.id.toString().should.equal('1', 'id is correct')
				project.creator.should.equal(user1, 'creator is correct')
				project.fundGoal.toString().should.equal(daiToken(10).toString(), 'fundGoal is correct')
				project.timeGoal.toString().should.equal(THIRTY_DAYS.toString(), 'timeGoal is correct')
				project.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
				project.totalFunds.toString().should.equal('0', 'totalFunds is correct')
				project.supporterCount.toString().should.equal('0', 'supporterCount is correct')				
			})
			it('emits a "ProjectMade" event', () => {
				const log = result.logs[0]
				log.event.should.eq('ProjectMade')
				const event = log.args
				event.id.toString().should.equal('1', 'id is correct')
				event.name.should.equal(name, 'name is correct')
				event.description.should.equal(description, 'description is correct')
				event.imgHash.should.equal(imgHash, 'image hash is correct')
				event.creator.should.equal(user1, 'user is correct')
				event.fundGoal.toString().should.equal(daiToken(10).toString(), 'fundGoal is correct')
				event.timeGoal.toString().should.equal(THIRTY_DAYS.toString(), 'timeGoal is correct')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
				event.totalFunds.toString().should.equal('0', 'totalFunds is correct')
				event.supporterCount.toString().should.equal('0', 'supporterCount is correct')
			})
		})
		describe('failure', () => {
			it('rejects non existent name, description, image hash and time goals that are greater than 60 days or equal to zero', () => {
				expectRevert(
					crowdfunder.makeProject(name, description, imgHash, daiToken(10), 0, { from: user1}), 
					'Error, time goal must exist in the future'
				);
				expectRevert(
					crowdfunder.makeProject(name, description, imgHash, daiToken(10), SIXTY_DAYS, { from: user1}), 
					'Error, time goal must be less than 60 days'
				);
				expectRevert(
					crowdfunder.makeProject('', description, imgHash, daiToken(10), THIRTY_DAYS, { from: user1}), 
					'Error, name must exist'
				);
				expectRevert(
					crowdfunder.makeProject(name, '', imgHash, daiToken(10), THIRTY_DAYS, { from: user1}), 
					'Error, description must exist'
				);
				expectRevert(
					crowdfunder.makeProject(name, description, '', daiToken(10), THIRTY_DAYS, { from: user1}), 
					'Error, image hash must exist'
				);
			})
		})
	})
	describe('funding projects', () => {
		let result
		beforeEach(async () => {
			// user1 makes project
			await crowdfunder.makeProject(name, description, imgHash, daiToken(10), THIRTY_DAYS , {from: user1})
			// approve crowdfunder to spend user2 daiToken
			await dai.approve(crowdfunder.address, daiToken(1), {from: user2})
			// user2 funds project
			await crowdfunder.contribute('1', daiToken(1), {from: user2})
			// approve crowdfunder to spend user3 daiToken
			await dai.approve(crowdfunder.address, daiToken(2), {from: user3})
			//user3 funds project
			result = await crowdfunder.contribute('1', daiToken(2), {from: user3})
		})
		describe('success', () => {
			let amount
			it('tracks supporter funds and total funds', async() => {
				let supporterFunds
				// Check user 2 token balance
				amount = await dai.balanceOf(user2);
				amount.toString().should.equal(daiToken(99).toString())
				// Check user 3 token balance
				amount = await dai.balanceOf(user3);
				amount.toString().should.equal(daiToken(98).toString())
				// Check crowdfunder token balance
				amount = await dai.balanceOf(crowdfunder.address)
				amount.toString().should.equal(daiToken(3).toString())
				// Check supporter funds on crowdfunder
				supporterFunds = await crowdfunder.supporterFunds('1', user2)
				supporterFunds.toString().should.equal(daiToken(1).toString(), 'user2 supporter funds is correct')
				supporterFunds = await crowdfunder.supporterFunds('1', user3)
				supporterFunds.toString().should.equal(daiToken(2).toString(), 'user3 supporter funds is correct')
				//total funds equal to user2 supporter funds and user3 supporter funds
				const project = await crowdfunder.projects('1')
				project.totalFunds.toString().should.equal(daiToken(3).toString(), 'total funds is correct')				
			})
			it('tracks the number of supporters', async() => {
				// user 2 funds project again
				await dai.approve(crowdfunder.address, daiToken(10), {from: user2})
				result = await crowdfunder.contribute('1', daiToken(1), {from: user2})
				const project = await crowdfunder.projects('1')
				project.supporterCount.toString().should.equal('2', 'supporter count is correct')
			})
			it('emits contribution event', () => {
				const log = result.logs[0]
				log.event.should.eq('Contribution')
				const event = log.args
				event.id.toString().should.equal('1', 'id is correct')
				event.supporter.should.equal(user3, 'supporter is correct')
				event.supporterCount.toString().should.equal('2', 'supporter count is correct')
				event.totalFunds.toString().should.equal(daiToken(3).toString(), 'totalFunds is correct')
				event.fundAmount.toString().should.equal(daiToken(2).toString(), 'fundAmount is correct')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
			})
		})
		describe('failure', () => {
			it('rejects funds when project time goal passed', async () => {
				await time.increase(THIRTY_DAYS + 1)
				expectRevert(
					crowdfunder.contribute('1', daiToken(3), {from: user2}),
					'Error, project must be open' 
				);
			})
			it('rejects invalid project ids', () => {
				expectRevert(
					crowdfunder.contribute('9999', daiToken(1), {from: user2}),
					'Error, wrong id'	
				);
			})
			it('rejects when creator tries to add funds to their own project', () => {
				expectRevert(
					crowdfunder.contribute('1', daiToken(1), {from: user1}),
					'Error, creators are not allowed to add funds to their own projects'
				);
			})
			it('rejects funds from projects that have been canceled', async() => {
				// user1 cancels their project
				await crowdfunder.cancelProject('1', {from: user1})
				// user2 tries to fund that project
				expectRevert(
					crowdfunder.contribute('1', daiToken(5), {from: user2}),
					'Error, project is canceled'
				);
			})
		})
	})
	describe('transfering collected funds', () => {
		let result
		beforeEach(async() => {
			//approve crowdfunder to spend 30 of user2's dai
			await dai.approve(crowdfunder.address, daiToken(30), {from: user2})
			// user1 makes project
			await crowdfunder.makeProject(name, description, imgHash, daiToken(10), THIRTY_DAYS, {from: user1})
			// user1 makes another project
			await crowdfunder.makeProject(name, description, imgHash, daiToken(20), THIRTY_DAYS, {from: user1})
		})
		describe('success', () => {
			it('transfers total funds minus fee amount to creator and transfers fee amount to fee account', async() => {
				let balance
				let projectFundsTransfered
				// user2 fully funds user1's first and second project
				await crowdfunder.contribute('1', daiToken(10), {from: user2})
				await crowdfunder.contribute('2', daiToken(20), {from: user2})
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				// user1 calls transfer function for both of their projects
				result = await crowdfunder.transfer(['1','2'], {from: user1})
				// check user 1 dai balance
				balance = await dai.balanceOf(user1)
				balance.toString().should.equal(daiToken(127).toString(), 'user1 dai balance is correct')
				// check feeAccount dai balance
				balance = await dai.balanceOf(feeAccount)
				balance.toString().should.equal(daiToken(3).toString(), 'feeAccount dai balance is correct')
				// check crowdfunder dai balance
				balance = await dai.balanceOf(crowdfunder.address)
				balance.toString().should.equal('0', 'crowdfunder dai balance is correct')
				// updates fully funded projects
				projectFundsTransfered = await crowdfunder.projectFundsTransfered('1')
				projectFundsTransfered.should.equal(true)
				projectFundsTransfered = await crowdfunder.projectFundsTransfered('2')
				projectFundsTransfered.should.equal(true)
								
			})
			it('emits Transfer events', () => {
				let log, event 
				// transfer event for user1's first project
				log = result.logs[0]
				log.event.should.eq('Transfer')
				event = log.args
				event.id.toString().should.equal('1', 'id is correct')
				event.creator.should.equal(user1, 'creator is correct')
				event.transferAmount.toString().should.equal(daiToken(9).toString(), 'transfer amount is correct')
				event.feeAmount.toString().should.equal(daiToken(1).toString(), 'fee amount is correct')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
				// transfer event for user1's second project
				log = result.logs[1]
				log.event.should.eq('Transfer')
				event = log.args
				event.id.toString().should.equal('2', 'id is correct')
				event.creator.should.equal(user1, 'creator is correct')
				event.transferAmount.toString().should.equal(daiToken(18).toString(), 'fund amount is correct')
				event.feeAmount.toString().should.equal(daiToken(2).toString(), 'transfer amount is correct')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
			})
		})
		describe('failure', () => {
			it('rejects empty ids array as an argument', async() => {
				// user2 fully funds first and second project
				await crowdfunder.contribute('1', daiToken(10), {from: user2})
				await crowdfunder.contribute('2', daiToken(20), {from: user2})
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				expectRevert(
					crowdfunder.transfer([], {from: user1}),
					'Error, ids array cannot be empty'
				);
			})
			it('rejects when atleast one of the projects is still open', async () => {
				// user2 fully funds first and second project
				await crowdfunder.contribute('1', daiToken(10), {from: user2})
				await crowdfunder.contribute('2', daiToken(20), {from: user2})
				// user1 calls transfer function on their projects before waiting until the projects have ended
				expectRevert(
					crowdfunder.transfer(['1','2'], {from: user1}),
					'Error, project still open'
				);
			})
			it('rejects when atleast one of the projects did not reach their funding goal', async() => {
				// user2 fully funds first project but not second
				await crowdfunder.contribute('1', daiToken(10), {from: user2})
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				expectRevert(
					crowdfunder.transfer(['1','2'], {from: user1}),
					'Error, project did not meet funding goal in time'
				);
			})
			it('rejects unauthorized transfers', async() => {
				// user2 fully funds first and second project
				await crowdfunder.contribute('1', daiToken(10), {from: user2})
				await crowdfunder.contribute('2', daiToken(20), {from: user2})
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				expectRevert(
					crowdfunder.transfer(['1','2'], {from: user2}),
					'Error, only creator can transfer collected project funds'
				);
			})
			it('rejects when project funds have already been transfered', async() => {
				// user2 fully funds first and second project
				await crowdfunder.contribute('1', daiToken(10), {from: user2})
				await crowdfunder.contribute('2', daiToken(20), {from: user2})
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				// user1 successfully transfers funds from both first and second project
				await crowdfunder.transfer(['1','2'], {from: user1})
				expectRevert(
					crowdfunder.transfer(['1','2'], {from: user1}),
					'Error, collected project funds already transfered'
				);
			})	
			it('rejects when at least one project has been canceled', async() => {
				// user2 fully funds first and second project
				await crowdfunder.contribute('1', daiToken(10), {from: user2})
				await crowdfunder.contribute('2', daiToken(20), {from: user2})
				// user1 cancels their second project
				await crowdfunder.cancelProject('2', {from: user1})
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				expectRevert(
					crowdfunder.transfer(['1','2'], {from: user1}),
					'Error, project is canceled'
				);
			})	
		})
	})
	describe('refunds', () => {
		
		beforeEach(async() => {
			//user1 makes project
			await crowdfunder.makeProject(name, description, imgHash, daiToken(10), THIRTY_DAYS , {from: user1})
			//user1 makes another project
			await crowdfunder.makeProject(name, description, imgHash, daiToken(20), THIRTY_DAYS , {from: user1})
			// user2 contributes funds to user1s first project
			await dai.approve(crowdfunder.address, daiToken(21), {from: user2})
			await crowdfunder.contribute('1', daiToken(5), {from: user2})
			// user2 contributes funds to user1s second project
			await crowdfunder.contribute('2', daiToken(10), {from: user2})
			// user3 contributes funds to user1s first project 
			await dai.approve(crowdfunder.address, daiToken(9), {from: user3})
			await crowdfunder.contribute('1', daiToken(3), {from: user3})
			// user3 contributes funds to user1s second project 
			await crowdfunder.contribute('2', daiToken(6), {from: user3})
		})
		describe('success', () => {
			let supporterFunds
			let result
			it('refunds supporter funds after project fails to meet funding deadline', async() => {
				await time.increase(THIRTY_DAYS + 1)
				// user 2 calls refund function
				await crowdfunder.refund(['1','2'], {from: user2})
				// sets user2 supporter funds for user1's first project back to 0
				supporterFunds = await crowdfunder.supporterFunds('1', user2)
				supporterFunds.toString().should.equal('0', 'user2 supporter funds is correct')
				// sets user2 supporter funds for user1's second project back to 0
				supporterFunds = await crowdfunder.supporterFunds('2', user2)
				supporterFunds.toString().should.equal('0', 'user2 supporter funds is correct')
				
				
			})
			it('refunds supporter funds after project is canceled', async() => {
				// user 1 cancels their first and second project
				await crowdfunder.cancelProject('1', {from: user1})
				await crowdfunder.cancelProject('2', {from: user1})
				// user 3 calls refund function
				result = await crowdfunder.refund(['1','2'], {from: user3})
				// sets user3 supporter funds for user1's first project back to 0
				supporterFunds = await crowdfunder.supporterFunds('1', user3)
				supporterFunds.toString().should.equal('0', 'user3 supporter funds is correct')	
				// sets user3 supporter funds for user1's second project back to 0
				supporterFunds = await crowdfunder.supporterFunds('2', user3)
				supporterFunds.toString().should.equal('0', 'user3 supporter funds is correct')	
			})
			it('emits a refund event', async() => {
				let log, event
				//refund event for user3's contribution to project number 1
				log = result.logs[0]
				log.event.should.eq('Refund')
				event = log.args
				event.id.toString().should.equal('1', 'id is correct')
				event.supporter.should.equal(user3, 'supporter is correct')
				event.refundAmount.toString().should.equal(daiToken(3).toString(), 'refundAmount is correct')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
				//refund event for user3's contribution to project number 2
				log = result.logs[1]
				log.event.should.eq('Refund')
				event = log.args
				event.id.toString().should.equal('2', 'id is correct')
				event.supporter.should.equal(user3, 'supporter is correct')
				event.refundAmount.toString().should.equal(daiToken(6).toString(), 'refundAmount is correct')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
			})
		})
		describe('failure', () => {
			it('rejects empty ids array as an argument', async() => {
				// user 2 adds enough funds for user1's first project to reach funding goal
				await crowdfunder.contribute('1', daiToken(4), {from: user2})
				// user 2 adds enough funds for user1's second project to reach funding goal
				await crowdfunder.contribute('2', daiToken(2), {from: user2})
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				expectRevert(
					crowdfunder.transfer([], {from: user1}),
					'Error, ids array cannot be empty'
				);
				
			})
			it('rejects refunds when project is still open', () => {
				// calls refund function before deadline passes
				expectRevert(
					crowdfunder.refund(['1','2'], {from: user2}), 
					'Error, no refunds unless project has been canceled or did not meet funding goal'
				);
			})
			it('rejects refunds when project reached funding goal by deadline', async() => {
				// user 2 adds enough funds for user1's first project to reach funding goal
				await crowdfunder.contribute('1', daiToken(2), {from: user2})
				// user 2 adds enough funds for user1's second project to reach funding goal
				await crowdfunder.contribute('2', daiToken(4), {from: user2})
				// increase time past funding deadline
				await time.increase(THIRTY_DAYS + 1)
				// calls refund function after project meets funding goal in time
				expectRevert(
					crowdfunder.refund(['1','2'], {from: user2}),
					'Error, no refunds unless project has been canceled or did not meet funding goal'
				);
			})
		})
		
	})
	describe('cancelling projects', () => {
		let result
		let timeGoal
		beforeEach(async() => {
			// user1 makes project
			await crowdfunder.makeProject(name, description, imgHash, daiToken(10), THIRTY_DAYS , {from: user1})
		})
		describe('success', () => {
			beforeEach(async() => {
				// user1 cancels project
				result = await crowdfunder.cancelProject('1', {from: user1})					
			})
			it('updates cancelled projects', async() => {
				const projectCancelled = await crowdfunder.projectCancelled('1')
				projectCancelled.should.equal(true)
			})
			it('emits cancel event', () => {
				const log = result.logs[0]
				log.event.should.eq('Cancel')
				const event = log.args
				event.id.toString().should.equal('1', 'id is correct')
				event.creator.should.equal(user1, 'creator is correct')
				event.fundGoal.toString().should.equal(daiToken(10).toString(), 'fundGoal is correct')
				event.timeGoal.toString().should.equal(THIRTY_DAYS.toString(), 'timeGoal is correct')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')				
			})
		})
		describe('failure', () => {
			it('rejects invalid project ids', () => {
				const invalidProjectId = '99999'
				expectRevert(
					crowdfunder.cancelProject(invalidProjectId, {from: user1}),
					'Error, wrong id'
				);
			})
			it('rejects unauthorized cancelations', () => {
				expectRevert(
					crowdfunder.cancelProject('1', {from: user2}),
					'Error, only creator can cancel their project'
				);
			})
			it('rejects when project has ended', async() => {
				await time.increase(THIRTY_DAYS + 1)
				expectRevert(
					crowdfunder.cancelProject('1', {from: user1}),
					'Error, project must be open'
				);
			})
		})
	})
})

