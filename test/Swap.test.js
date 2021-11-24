import { expect } from 'chai'
import { futureTime, toWei, fromWei, mainnetDai, mainnetWeth } from './helpers'
const { expectRevert, time } = require('@openzeppelin/test-helpers')
const Swap = artifacts.require("Swap")
const IERC20 = artifacts.require("IERC20")


require('chai')
	.use(require('chai-as-promised'))
	.should()

contract("Swap",([deployer, user1]) => {
    const poolFee = "3000"
    const swapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
    const quoter = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
    let swap, swapRef
    beforeEach(async() => {
        swap = await Swap.new(mainnetDai, mainnetWeth)
        swapRef = new web3.eth.Contract(Swap.abi, swap.address)
    })
    describe("deployment", () => {
        let result
        it("tracks the poolFee, dai address and weth address", async() => {
            result = await swap.poolFee();
            result.toString().should.equal(poolFee);
            result = await swap.dai();
            result.toString().should.equal(mainnetDai)
            result = await swap.weth();
            result.toString().should.equal(mainnetWeth)
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
        it("returns ETH input value", async() => {
            // Must be called off chain using web3 .call() method
            result = await swapRef.methods.getEthInputAmount(daiAmount).call()
            result.toString().length.should.be.at.least(1, 'did not return ETH input value ')
            console.log(`Exact DAI output: ${fromWei(daiAmount)}`)
            console.log(`Returned ETH input: ${fromWei(result)}`)
            console.log(`DAI/ETH ratio: ${result/daiAmount}`)
            console.log(`Compare price DAI/ETH at e.g https://info.uniswap.org/#/pools/0xc2e9f25be6257c210d7adf0d4cd6e3e881ba25f8 e.g 0.00031412`)
        })
    })
    describe("converting ETH to DAI", () => {
        describe("success", () => {
            let ethBalance
            let daiBalance
            let daiRef
            let quotedEthAmountIn
            let maxEthAmountIn
            let ethAmountIn
            let daiAmountOut = toWei(100) // 100 dai out
            let result
            beforeEach(async() => {
                // load dai contract
                daiRef = new web3.eth.Contract(IERC20.abi, mainnetDai)
    
                // start Ether and DAI balance before swap
                ethBalance = await web3.eth.getBalance(user1) //BN
                console.log(`start ETH balance: ${fromWei(ethBalance)}`)
    
                daiBalance = await daiRef.methods.balanceOf(user1).call()
                console.log(`start DAI balance: ${fromWei(daiBalance)}`)
                //Quote about how much Eth is needed to get an exact amount of Dai
                quotedEthAmountIn = await swapRef.methods.getEthInputAmount(daiAmountOut).call()
                console.log(`The quoted ETH amount input for an exact DAI output of ${fromWei(daiAmountOut)} is ${fromWei(quotedEthAmountIn)}`)
                // Use that quoted amount to determine the max amount of ether to send with the convertEthToExactDai function
                // Will send 110% of the quoted amount to ensure the transaction goes through 
                // The ether thats left over after the swap has been executed will be sent back to the user
                maxEthAmountIn = 1.1*(quotedEthAmountIn)
                console.log(`Max ETH amount input is ${fromWei(maxEthAmountIn)}, which is equal to 110% of the quoted ETH amount input`)
                // user1 approves swap contract to spend their Dai
                result = await swap.convertEthToExactDai(daiAmountOut, futureTime(15), {from : user1, value: maxEthAmountIn})
            })
            it("emits a Converted event", async() => {
                const log = result.logs[0]
                log.event.should.eq('Converted')
                const event = log.args
                event.user.should.eq(user1, "user is incorrect")
                event.amountOut.toString().should.eq(daiAmountOut.toString(), "amount out is incorrect")
                event.amountInMaximum.toString().should.eq(maxEthAmountIn.toString(), "max amount in is incorrect")
                // Amount in should be less than or equal to max amount in
                ethAmountIn = event.amountIn
                expect(+ethAmountIn.toString()).to.be.at.most(+maxEthAmountIn.toString(), "amount in is incorrect")
            })
            it("successfully executes swap and refunds excess ether back to user", async() => {
                const newEthBalance = await web3.eth.getBalance(user1) //Actual Eth balance after swap function executed
                const subtractedEthBalance = +ethBalance.toString() - +ethAmountIn.toString() //Subtracted ETH balance excluding fees
                // There should be no ether left in the smart contract. All of it should have been refunded
                const swapContractBalance = await web3.eth.getBalance(swap.address)
                swapContractBalance.toString().should.eq('0')
                // The ether paid upfront, maxEthAmount, should be less than or equal to the ethAmountIn
                expect(+maxEthAmountIn.toString()).to.be.at.least(+ethAmountIn.toString())
                const percentError = 100*Math.abs(ethAmountIn - quotedEthAmountIn)/(ethAmountIn)
                console.log(`The percent error between the quoted ETH amount in and the actual ETH amount in is ${percentError}%`)
                // newEthBalance should be less than subtracted Eth balance due to fees
                expect(+newEthBalance.toString()).to.be.below(+subtractedEthBalance.toString())
                console.log(`ETH balance after swap: ${fromWei(newEthBalance)} should be approximately ${fromWei(subtractedEthBalance)}`)
                const newDaiBalance = await daiRef.methods.balanceOf(user1).call()
                newDaiBalance.toString().should.eq((+daiBalance.toString()+ +daiAmountOut.toString()).toString())
                console.log(`DAI balance after swap: ${fromWei(newDaiBalance)}`)
            })
        })
        describe("failure",() => {
            it("It rejects when dai amount or eth amount equals to zero", () => {
                expectRevert(
                    swap.convertEthToExactDai('0', futureTime(15), {from : user1, value: toWei(1)}),
                    "Error, DAI amount out must be greater than 0"
                );
                expectRevert(
                    swap.convertEthToExactDai(toWei(30), futureTime(15), {from : user1, value: '0'}),
                    "Error, ETH amount must be greater than 0"
                );
            })  
        })
    })
})
