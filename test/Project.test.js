import { daiToken, futureTime} from './helpers'
const { expectRevert, time } = require('@openzeppelin/test-helpers')
const Project = artifacts.require("Project")
const Crowdfunder = artifacts.require("Crowdfunder")
const MockDai = artifacts.require("MockDai") 

require('chai')
	.use(require('chai-as-promised'))
	.should()

//Not testing this contracts functions since the crowdundingplatform contract makes use of each of these functions directly.
//Only testing the "onlyParentContract" modifier thats applied to all the external functions in the contract. 

contract("Project", ([user1]) => {
	let project, crowdfunder, dai, projectAddress, timeGoal
	const onlyParentContract = 'Error, only parent contract can interact with this contract'
	const THIRTY_DAYS = +time.duration.days(30)
	beforeEach(async()=> {
		dai = await MockDai.new()
		crowdfunder = await Crowdfunder.new(dai.address, user1, '10')
		timeGoal = futureTime(THIRTY_DAYS)
		await crowdfunder.makeProject('Sample Name', 'Sample description', 'abc123', daiToken(10), timeGoal, { from: user1 })
		projectAddress = await crowdfunder.projects('1')
		project = new web3.eth.Contract(Project.abi, projectAddress)
	})
	describe("access", () => {
		it("tracks the parent smart contract address", async() => {
			const parentAddress = await project.methods.parentAddress().call()
			parentAddress.should.equal(crowdfunder.address, "project address is incorrect")
		})
		it("rejects unauthorized access to all external functions", async() => {
			// user1, deployer of the crowdfunder contract, should not have access to any of this contracts functions.
			expectRevert( project.methods.cancel(user1).send({from: user1}), onlyParentContract);
			expectRevert( project.methods.contribute(daiToken(2), user1).send({from: user1}), onlyParentContract );
			expectRevert( project.methods.disburse('10', user1, user1).send({from: user1}), onlyParentContract );
			expectRevert( project.methods.claimRefund(user1).send({from: user1}), onlyParentContract );
		})
	})
})

