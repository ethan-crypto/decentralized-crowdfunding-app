require('babel-register');
require('babel-polyfill');
require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const privateKeys = process.env.PRIVATE_KEYS || ""

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(
          privateKeys.split(','), //Array of account private keys
          `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}` //Url to an Ethereum node
        )
      },
      network_id: 42
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: { 
    solc: {
      version: "0.8.9",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
