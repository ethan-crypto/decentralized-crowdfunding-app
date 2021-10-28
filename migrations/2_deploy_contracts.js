const Dai = artifacts.require("Dai");
const Crowdfunder = artifacts.require("Crowdfunder");
module.exports = async function (deployer) {
  await deployer.deploy(Dai)
  const accounts = await web3.eth.getAccounts()
  const feeAccount = accounts[0]
  const feePercent = 10
  await deployer.deploy(Crowdfunder, feeAccount, feePercent)
};