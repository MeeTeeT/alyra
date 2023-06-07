const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();


module.exports = {
  

  networks: {
   
     development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
     },

     goerli: {
         provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://goerli.infura.io/v3/${process.env.INFURA_ID}`),
       
     
        network_id: 5,       // Goerli's id
      //  confirmations: 2,    // # of confirmations to wait between deployments. (default: 0)
       // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
       // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
       },

       mumbai: {
        provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`),
      
    
       network_id: 80001,       // mumbai id
     //  confirmations: 2,    // # of confirmations to wait between deployments. (default: 0)
      // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
      },
   
  },
  plugins: ["solidity-coverage"],

   mocha: {
   reporter: 'eth-gas-reporter',
   showTimeSpent : true
  },

 
  compilers: {
    solc: {
      version: "0.8.13",      // Fetch exact version from solc-bin (default: truffle's version)
       settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200
        },
     
       }
    }
  },

};
