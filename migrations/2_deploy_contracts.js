const ropstenDai = "0xad6d458402f60fd3bd25163575031acdce07538d"
const ropstenWeth = "0xc778417e063141139fce010982780140aa0cd5ab"
const Swap = artifacts.require("Swap");
const Crowdfunder = artifacts.require("Crowdfunder");
module.exports = async function (deployer) {
  //await deployer.deploy(Swap, ropstenDai, ropstenWeth)
  const accounts = await web3.eth.getAccounts()
  const feeAccount = accounts[0]
  const feePercent = 10
  await deployer.deploy(Crowdfunder, ropstenDai, ropstenWeth, feeAccount, feePercent)
};