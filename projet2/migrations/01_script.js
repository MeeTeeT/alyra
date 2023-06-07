const Voting = artifacts.require("Voting");

module.exports = async (deployer) => {
  //const accounts = await web3.eth.getAccounts();
    deployer.deploy(Voting /*, {from:accounts[0]}*/);
}
