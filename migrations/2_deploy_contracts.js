const MockDai = artifacts.require("MockDai");
const Crowdfunder = artifacts.require("Crowdfunder");
module.exports = async function (deployer) {
  await deployer.deploy(MockDai)
  dai = await MockDai.deployed();
  const accounts = await web3.eth.getAccounts()
  const feeAccount = accounts[0]
  const feePercent = 10
  await deployer.deploy(Crowdfunder, dai.address, feeAccount, feePercent)
};