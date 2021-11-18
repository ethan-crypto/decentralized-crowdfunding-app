
const Web3 = require('web3') 	
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
import { contractsLoadedSelector } from '../src/store/selectors'
const { expectRevert, time } = require('@openzeppelin/test-helpers')
const Swap = artifacts.require("Swap")

const toWei = (num) => web3.utils.toWei(num.toString(), "ether")
const fromWei = (num) => web3.utils.fromWei(num.toString())

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract("Swap",(accounts) => {
    const poolFee = "3000"
    const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    const weth9Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
    const quoter = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
    let swap
    beforeEach(async() => {
        swap = await Swap.new(daiAddress, weth9Address)
    })
    describe("deployment", () => {
        let result
        it("tracks the poolFee, dai address and weth9 address", async() => {
            result = await swap.poolFee();
            result.toString().should.equal(poolFee);
            result = await swap.dai();
            result.toString().should.equal(daiAddress)
            result = await swap.weth9();
            result.toString().should.equal(weth9Address)
        })
        it("tracks the uniswap swapRouter and quoter contract addresses", async() => {
            result = await swap.swapRouter();
            result.toString().should.equal(swapRouter);
            result = await swap.quoter();
            result.toString().should.equal(quoter)
        })
    })
    describe("get ETH input amount for a given DAI output", () => {
        let result
        let daiAmount = toWei(50)
        it("rejects when DAI amount out is zero", () => {
            expectRevert(swap.getEthInputAmount('0'), 'Error, DAI amount out must be greater than 0')
        })
        it("returns ETH input value", async() => {
            let swapRef = new web3.eth.Contract(Swap.abi, swap.address)
            result = await swapRef.methods.getEthInputAmount(daiAmount).call()
            result.toString().length.should.be.at.least(1, 'did not return ETH input value ')
            console.log(`Exact DAI output: ${fromWei(daiAmount)}`)
            console.log(`Returned ETH input: ${fromWei(result)}`)
            console.log(`DAI/ETH ratio: ${result/DAI}`)
            console.log(`compared price DAI/ETH at e.g https://info.uniswap.org/#/pools/0xc2e9f25be6257c210d7adf0d4cd6e3e881ba25f8 e.g 0.00035312`)
        })
    })
})
