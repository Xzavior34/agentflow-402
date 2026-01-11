
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

module.exports = {
  solidity: {
    // 0.8.19 avoids the "PUSH0" opcode crash on zkEVM
    version: "0.8.19", 
    settings: {
      optimizer: {
        enabled: true,
        // Low runs (1) keeps the deployment bytecode small and cheap
        runs: 1, 
      },
      // THIS IS THE FIX for "UnimplementedFeatureError"
      // It enables the modern pipeline to handle your nested arrays/strings
      viaIR: true, 
    },
  },
  networks: {
    cronosZkEvm: {
      url: "https://testnet.zkevm.cronos.org",
      chainId: 240,
      accounts: [PRIVATE_KEY],
    },
  },
  paths: {
    sources: "./contracts", 
    artifacts: "./artifacts",
    cache: "./cache",
  }
};