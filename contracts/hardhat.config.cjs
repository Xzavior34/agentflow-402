/**
 * Hardhat Configuration for AgentMarket
 * Cronos zkEVM Testnet Deployment
 * 
 * Setup:
 * 1. cd contracts
 * 2. npm init -y
 * 3. npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
 * 4. Create .env with PRIVATE_KEY
 * 5. npx hardhat compile
 * 6. npx hardhat run scripts/deploy.js --network cronosZkEvm
 */

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    // Cronos zkEVM Testnet (Primary Target)
    cronosZkEvm: {
      url: "https://testnet.zkevm.cronos.org",
      chainId: 240,
      accounts: [PRIVATE_KEY],
      gasPrice: 2000000000, // 2 gwei
    },
    // Cronos Testnet (Fallback)
    cronosTestnet: {
      url: "https://evm-t3.cronos.org/",
      chainId: 338,
      accounts: [PRIVATE_KEY],
      gasPrice: 5000000000000, // 5000 gwei
    },
    // Cronos Mainnet (Production)
    cronosMainnet: {
      url: "https://evm.cronos.org",
      chainId: 25,
      accounts: [PRIVATE_KEY],
    },
    // Local development
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      cronosZkEvm: process.env.CRONOS_API_KEY || "",
      cronosTestnet: process.env.CRONOS_API_KEY || "",
    },
    customChains: [
      {
        network: "cronosZkEvm",
        chainId: 240,
        urls: {
          apiURL: "https://explorer.zkevm.cronos.org/api",
          browserURL: "https://explorer.zkevm.cronos.org",
        },
      },
      {
        network: "cronosTestnet",
        chainId: 338,
        urls: {
          apiURL: "https://api-testnet.cronoscan.com/api",
          browserURL: "https://testnet.cronoscan.com",
        },
      },
    ],
  },
  paths: {
    sources: "./",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
