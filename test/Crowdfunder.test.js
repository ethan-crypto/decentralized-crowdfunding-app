import { web3 } from '@openzeppelin/test-helpers/src/setup'
import { expect } from 'chai'
import { EVM_REVERT, futureTime, mainnetDai, mainnetWeth, toWei, fromWei, wait } from './helpers'
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
	const poolFee = "3000"
	const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
	const quoter = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
	let crowdfunder, crowdfunderRef, dai, swap, swapRef, deadline
	let timeIncrease = 0
	beforeEach(async () => {
		swap = await Swap.new(mainnetDai, mainnetWeth)
		crowdfunder = await Crowdfunder.new(mainnetDai, mainnetWeth, feeAccount, feePercent)

		deadline = futureTime(30 + timeIncrease)
		swap.convertEthToExactDai(toWei(100), deadline, { value: toWei(0.4), from: user1 });
		swap.convertEthToExactDai(toWei(100), deadline, { value: toWei(0.4), from: user2 });
		swap.convertEthToExactDai(toWei(100), deadline, { value: toWei(0.4), from: user3 });

		dai = new web3.eth.Contract(IERC20.abi, mainnetDai)
		crowdfunderRef = new web3.eth.Contract(Crowdfunder.abi, crowdfunder.address)
		swapRef = new web3.eth.Contract(Swap.abi, swap.address)	
	})

	describe('deployment', () => {
		let result
		it('tracks the feeAccount', async () => {
			result = await crowdfunder.feeAccount()
			result.should.equal(feeAccount)
		})
		it('tracks the feePercent', async () => {
			result = await crowdfunder.feePercent()
			result.toString().should.equal(feePercent.toString())
		})
		it('tracks the dai address', async () => {
			result = await crowdfunder.dai()
			result.toString().should.equal(mainnetDai.toString())
		})
		it("tracks the poolFee, dai address and weth address", async () => {
			result = await crowdfunder.poolFee();
			result.toString().should.equal(poolFee);
			result = await crowdfunder.dai();
			result.toString().should.equal(mainnetDai)
			result = await crowdfunder.weth();
			result.toString().should.equal(mainnetWeth)
		})
		it("tracks the uniswap swapRouter and quoter contract addresses", async () => {
			result = await crowdfunder.swapRouter();
			result.toString().should.equal(swapRouter);
			result = await crowdfunder.quoter();
			result.toString().should.equal(quoter)
		})

	})
	describe("geting ETH input amount for a given DAI output", () => {
		let result
		let daiAmount = toWei(50)
		it("returns ETH input value", async () => {
			// Must be called off chain using web3 .call() method
			result = await crowdfunderRef.methods.getEthInputAmount(daiAmount).call()
			result.toString().length.should.be.at.least(1, 'did not return ETH input value ')
			console.log(`Exact DAI output: ${fromWei(daiAmount)}`)
			console.log(`Returned ETH input: ${fromWei(result)}`)
			console.log(`DAI/ETH ratio: ${result / daiAmount}`)
			console.log(`Compare price DAI/ETH at e.g https://info.uniswap.org/#/pools/0xc2e9f25be6257c210d7adf0d4cd6e3e881ba25f8 e.g 0.00031412`)
		})
	})

	describe('making projects', () => {
		let result
		let timeGoal
		describe('success', () => {
			beforeEach(async () => {
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
					crowdfunder.makeProject(name, description, imgHash, toWei(10), 0, { from: user1 }),
					'Error, time goal must exist in the future'
				);
				expectRevert(
					crowdfunder.makeProject(name, description, imgHash, toWei(10), futureTime(SIXTY_DAYS + 7), { from: user1 }),
					'Error, time goal must be less than 60 days'
				);
				expectRevert(
					crowdfunder.makeProject('', description, imgHash, toWei(10), timeGoal, { from: user1 }),
					'Error, name must exist'
				);
				expectRevert(
					crowdfunder.makeProject(name, '', imgHash, toWei(10), timeGoal, { from: user1 }),
					'Error, description must exist'
				);
				expectRevert(
					crowdfunder.makeProject(name, description, '', toWei(10), timeGoal, { from: user1 }),
					'Error, image hash must exist'
				);
			})
		})
	})


	describe('contributions', () => {

		beforeEach(async () => {
			let timeGoal = futureTime(THIRTY_DAYS + timeIncrease)
			await crowdfunder.makeProject(name, description, imgHash, toWei(100), timeGoal, { from: user1 })
		})
		describe('success', () => {
			let result, quotedEthAmountIn, ethAmountIn, maxEthAmountIn, timeGoal, projectAddress, project,
				user2DaiBalance, user3DaiBalance, user3EthBalance
			beforeEach(async () => {
				// user 2, user 3 starting DAI balance and user3 starting ETH balance
				user2DaiBalance = await dai.methods.balanceOf(user2).call()
				user3DaiBalance = await dai.methods.balanceOf(user3).call()
				user3EthBalance = await web3.eth.getBalance(user3)

				// --- DAI contributions ---
				// fetch project address
				projectAddress = await crowdfunder.projects('1')
				// approve project to spend user2 daiToken
				await dai.methods.approve(projectAddress, toWei(20)).send({ from: user2 })
				// user2 contributes dai directly to the project
				await crowdfunder.contribute('1', toWei(20), deadline, { from: user2 })

				// --- ETH to DAI contributions ---
				//Quote about how much ETH is needed to get exactly 2 DAI.
				quotedEthAmountIn = await crowdfunderRef.methods.getEthInputAmount(toWei(40)).call()
				// Use that quoted amount to determine the max amount of ether to send with the contribute function
				// Will send 110% of the quoted amount to ensure the transaction goes through 
				// The ether thats left over after the swap has been executed will be sent back to the user
				maxEthAmountIn = Math.floor(1.1 * (quotedEthAmountIn))
				//user3 contributes 2 DAI with ETH using the maxEthAmountIn value. 
				result = await crowdfunder.contribute('1', toWei(40), deadline, { from: user3, value: maxEthAmountIn })
			})
			it('tracks supporter funds and total funds', async () => {
				let supporterFunds, balance
				// Check user 2 DAI balance
				balance = await dai.methods.balanceOf(user2).call()
				balance.toString().should.equal((+user2DaiBalance.toString() - toWei(20).toString()).toString(), "user2 dai balance is incorrect")
				// Check user 3 token balance
				balance = await dai.methods.balanceOf(user3).call()
				balance.toString().should.equal(user3DaiBalance.toString(), "user3 dai balance is incorrect")
				// Check project DAI balance and raised funds state variable and make sure they are equal.
				balance = await dai.methods.balanceOf(projectAddress).call()
				balance.toString().should.equal(toWei(60).toString())
				project = new web3.eth.Contract(Project.abi, projectAddress)
				const raisedFunds = await project.methods.raisedFunds().call()
				raisedFunds.toString().should.equal(toWei(60).toString())
				// Check supporter funds on project
				supporterFunds = await project.methods.supporterFunds(user2).call()
				supporterFunds.toString().should.equal(toWei(20).toString(), 'user2 supporter funds is incorrect')
				supporterFunds = await project.methods.supporterFunds(user3).call()
				supporterFunds.toString().should.equal(toWei(40).toString(), 'user3 supporter funds is incorrect')
			})
			it('emits Contribution event', () => {
				const log = result.logs[1]
				log.event.should.eq('Contribution')
				const event = log.args
				event.id.toString().should.equal('1', 'id is incorrect')
				event.supporter.should.equal(user3, 'supporter is incorrect')
				event.newSupporter.should.equal(true, 'supporter count is incorrect')
				event.raisedFunds.toString().should.equal(toWei(60).toString(), 'raisedFunds is incorrect')
				event.fundAmount.toString().should.equal(toWei(40).toString(), 'fundAmount is incorrect')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
			})
			it("emits a Converted event for ETH to DAI contributions", async () => {
				const log = result.logs[0]
				log.event.should.eq('Converted')
				const event = log.args
				event.user.should.eq(user3, "user is incorrect")
				event.amountOut.toString().should.eq(toWei(40).toString(), "amount out is incorrect")
				event.amountInMaximum.toString().should.eq(maxEthAmountIn.toString(), "max amount in is incorrect")
				// Amount in should be less than or equal to max amount in
				ethAmountIn = event.amountIn
				expect(+ethAmountIn.toString()).to.be.at.most(+maxEthAmountIn.toString(), "amount in is incorrect")
			})
			it("successfully executes swap for ETH to DAI contributions and refunds excess ether back to user", async () => {
				const newEthBalance = await web3.eth.getBalance(user3) //Actual Eth balance after swap function executed
				const subtractedEthBalance = +user3EthBalance.toString() - +ethAmountIn.toString() //Subtracted ETH balance excluding fees
				// There should be no ether left in the crowdfunder contract. All of it should have been refunded back to the user
				const crowdfunderEthBalance = await web3.eth.getBalance(crowdfunder.address)
				crowdfunderEthBalance.toString().should.eq('0')
				// The ether paid upfront, maxEthAmount, should be less than or equal to ethAmountIn
				expect(+maxEthAmountIn.toString()).to.be.at.least(+ethAmountIn.toString())
				const percentError = 100 * Math.abs(ethAmountIn - quotedEthAmountIn) / (ethAmountIn)
				console.log(`The percent error between the quoted ETH amount in and the actual ETH amount in is ${percentError}%`)
				// newEthBalance should be less than subtracted Eth balance due to fees
				expect(+newEthBalance.toString()).to.be.below(+subtractedEthBalance.toString())
				console.log(`ETH balance after swap: ${fromWei(newEthBalance)} should be approximately ${fromWei(subtractedEthBalance)}`)
			})
		})
		describe('failure', () => {

			it('rejects funds when project time goal passed', async () => {
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease = THIRTY_DAYS + 1
				expectRevert(
					crowdfunder.contribute('1', toWei(3), deadline, { from: user2 }),
					'Error, project must be open'
				);
			})
			it('rejects invalid project ids', () => {
				expectRevert(
					crowdfunder.contribute('9999', toWei(1), deadline, { from: user2 }),
					'revert'
				);
			})
			it('rejects when DAI contribution amount is 0', () => {
				expectRevert(
					crowdfunder.contribute('1', toWei(0), deadline, { from: user2 }),
					'Error, DAI amount must be greater than 0'
				);
			})
			it('rejects when creator tries to add funds to their own project', () => {
				expectRevert(
					crowdfunder.contribute('1', toWei(1), deadline, { from: user1 }),
					'Error, creators are not allowed to add funds to their own projects'
				);
			})
			it('rejects funds from projects that have been canceled', async () => {
				// user1 cancels their project
				await crowdfunder.cancel('1', { from: user1 })
				// user2 tries to fund that project
				expectRevert(
					crowdfunder.contribute('1', toWei(5), deadline, { from: user2 }),
					'Error, project cancelled'
				);
			})
		})
	})

	describe('disbursing collected funds', () => {
		let timeGoal, projectAddress
		beforeEach(async () => {
			timeGoal = futureTime(THIRTY_DAYS + timeIncrease)
			// user1 makes project
			await crowdfunder.makeProject(name, description, imgHash, toWei(100), timeGoal, { from: user1 })
			//approve project to spend 100 of user2's DAI
			projectAddress = await crowdfunder.projects('1')
			await dai.methods.approve(projectAddress, toWei(100)).send({ from: user2 })
		})
		describe('success', () => {
			let result, user1DaiBalance, feeAccountDaiBalance
			beforeEach(async () => {
				// Check user1 and fee account starting DAI balance
				user1DaiBalance = await dai.methods.balanceOf(user1).call()
				feeAccountDaiBalance = await dai.methods.balanceOf(feeAccount).call()
			})
			it('disburses raised funds to creator with fee applied and fee amount to fee account', async () => {
				let newBalance
				// user2 fully funds user1's project
				await crowdfunder.contribute('1', toWei(100), deadline, { from: user2 })
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				// user1 calls disburse function once for both of their projects
				result = await crowdfunder.disburse('1', { from: user1 })
				// check user 1 dai balance
				newBalance = await dai.methods.balanceOf(user1).call()
				expect(+newBalance.toString() - user1DaiBalance.toString()).to.eq(+toWei(90).toString(), 'user1 dai balance is incorrect')
				//balance.toString().should.equal((+user1DaiBalance.toString()+ +toWei(9).toString()).toString(), )
				// check feeAccount dai balance
				newBalance = await dai.methods.balanceOf(feeAccount).call()
				newBalance.toString().should.equal((+feeAccountDaiBalance.toString() + +toWei(10).toString()).toString(), 'feeAccount dai balance is incorrect')
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
				event.disburseAmount.toString().should.equal(toWei(90).toString(), 'disburse amount is incorrect')
				event.feeAmount.toString().should.equal(toWei(10).toString(), 'fee amount is incorrect')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is not present')
			})
		})
		describe('failure', () => {
			it('rejects when project is still open', async () => {
				// user2 fully funds project
				await crowdfunder.contribute('1', toWei(100), deadline, { from: user2 })
				// user1 calls disburse function on their project before waiting until the project has ended
				expectRevert(
					crowdfunder.disburse('1', { from: user1 }),
					'Error, project still open'
				);
			})
			it('rejects when project did not reach its funding goal', async () => {
				// user2 contributes 9 dai to the project, 1 shy of its funding goal
				await crowdfunder.contribute('1', toWei(99), deadline, { from: user2 })
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				expectRevert(
					crowdfunder.disburse('1', { from: user1 }),
					'Error, project not fullyFunded'
				);
			})
			it('rejects unauthorized disburses', async () => {
				// user2 fully funds project
				await crowdfunder.contribute('1', toWei(100), deadline, { from: user2 })
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				expectRevert(
					crowdfunder.disburse('1', { from: user2 }),
					'Error, only creator can disburse collected project funds'
				);
			})
			it('rejects when project funds have already been disbursed', async () => {
				// user2 fully funds project
				await crowdfunder.contribute('1', toWei(100), deadline, { from: user2 })
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				// user1 successfully transfers funds from first project
				await crowdfunder.disburse('1', { from: user1 })
				expectRevert(
					crowdfunder.disburse('1', { from: user1 }),
					'Error, project not fullyFunded'
				);
			})
			it('rejects when project has been cancelled', async () => {
				// user2 fully funds first project
				await crowdfunder.contribute('1', toWei(100), deadline, { from: user2 })
				// user1 cancels their project
				await crowdfunder.cancel('1', { from: user1 })
				// increase the time past funding goal
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				expectRevert(
					crowdfunder.disburse('1', { from: user1 }),
					'Error, project cancelled'
				);
			})
		})
	})


	describe('refunds', () => {
		let timeGoal, projectAddress, project
		beforeEach(async () => {
			timeGoal = futureTime(THIRTY_DAYS + timeIncrease)
			//user1 makes project
			await crowdfunder.makeProject(name, description, imgHash, toWei(100), timeGoal, { from: user1 })
			projectAddress = await crowdfunder.projects('1')
			// user2 contributes funds to user1s project
			await dai.methods.approve(projectAddress, toWei(70)).send({ from: user2 })
			await crowdfunder.contribute('1', toWei(50), deadline, { from: user2 })
			// user3 contributes funds to user1s project 
			await dai.methods.approve(projectAddress, toWei(30)).send({ from: user3 })
			await crowdfunder.contribute('1', toWei(30), deadline, { from: user3 })
		})
		describe('success', () => {
			let result, supporterFunds
			it('refunds supporter funds after project fails to meet funding deadline', async () => {
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				// user 2 calls refund function
				await crowdfunder.claimRefund('1', { from: user2 })
				// sets user2 supporter funds for user1's project back to 0
				project = new web3.eth.Contract(Project.abi, projectAddress)
				supporterFunds = await project.methods.supporterFunds(user2).call()
				supporterFunds.toString().should.equal('0', 'user2 supporter funds is incorrect')

			})
			it('refunds supporter funds after project has been cancelled', async () => {
				// user 1 cancels their project
				await crowdfunder.cancel('1', { from: user1 })
				// user 3 calls refund function
				result = await crowdfunder.claimRefund('1', { from: user3 })
				// sets user3 supporter funds for user1's project back to 0
				project = new web3.eth.Contract(Project.abi, projectAddress)
				supporterFunds = await project.methods.supporterFunds(user3).call()
				supporterFunds.toString().should.equal('0', 'user3 supporter funds is incorrect')
			})
			it('emits a refund event', async () => {
				//refund event for user3's contribution to user1's cancelled project
				const log = result.logs[0]
				log.event.should.eq('Refund')
				const event = log.args
				event.id.toString().should.equal('1', 'id is incorrect')
				event.supporter.should.equal(user3, 'supporter is incorrect')
				event.raisedFunds.toString().should.equal(toWei(50).toString(), 'raisedFunds is incorrect')
				event.refundAmount.toString().should.equal(toWei(30).toString(), 'refundAmount is incorrect')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
			})
		})
		describe('failure', () => {
			it('rejects refunds when project is still open', () => {
				// calls refund function before deadline passes
				expectRevert(
					crowdfunder.claimRefund('1', { from: user2 }),
					'Error, no refunds unless project has been cancelled or did not meet funding goal'
				);
			})
			it('rejects refunds when project reached funding goal by deadline', async () => {
				// user 2 adds enough funds for user1's first project to reach funding goal
				await crowdfunder.contribute('1', toWei(20), deadline, { from: user2 })
				// increase time past funding deadline
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				// calls refund function after project meets funding goal in time
				expectRevert(
					crowdfunder.claimRefund('1', { from: user2 }),
					'Error, no refunds unless project has been cancelled or did not meet funding goal'
				);
			})
		})

	})
	describe('cancelling projects', () => {
		let result, timeGoal, project
		beforeEach(async () => {
			timeGoal = futureTime(THIRTY_DAYS + timeIncrease)
			// user1 makes project
			await crowdfunder.makeProject(name, description, imgHash, toWei(100), timeGoal, { from: user1 })
		})
		describe('success', () => {
			beforeEach(async () => {
				// user1 cancels project
				result = await crowdfunder.cancel('1', { from: user1 })
			})
			it('updates cancelled projects', async () => {
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
				event.fundGoal.toString().should.equal(toWei(100).toString(), 'fundGoal is correct')
				event.timeGoal.toString().should.equal(timeGoal.toString(), 'timeGoal is correct')
				event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
			})
		})
		describe('failure', () => {
			it('rejects when project has ended', async () => {
				await time.increase(THIRTY_DAYS + 1)
				timeIncrease += THIRTY_DAYS + 1
				expectRevert(
					crowdfunder.cancel('1', { from: user1 }),
					'Error, project must be open'
				);
			})
			it('rejects invalid project ids', () => {
				const invalidProjectId = '99999'
				expectRevert(
					crowdfunder.cancel(invalidProjectId, { from: user1 }),
					'revert'
				);
			})
			it('rejects unauthorized cancelations', async () => {
				expectRevert(
					crowdfunder.cancel('1', { from: user2 }),
					'Error, only creator can cancel their project'
				);
				await wait(1)
			})
		})
	})
		
})
