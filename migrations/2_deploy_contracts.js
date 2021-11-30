const mainnetDai = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const mainnetWeth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const Swap = artifacts.require("Swap");
const Crowdfunder = artifacts.require("Crowdfunder");
module.exports = async function (deployer) {
  await deployer.deploy(Swap, mainnetDai, mainnetWeth)
  const accounts = await web3.eth.getAccounts()
  const feeAccount = accounts[0]
  const feePercent = 10
  await deployer.deploy(Crowdfunder, mainnetDai, mainnetWeth, feeAccount, feePercent)
};