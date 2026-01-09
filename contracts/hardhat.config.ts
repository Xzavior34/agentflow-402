/**
 * Hardhat Configuration for AgentMarket
 * 
 * Setup:
 * 1. cd contracts
 * 2. npm init -y
 * 3. npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox typescript ts-node
 * 4. Set PRIVATE_KEY environment variable
 * 5. npx hardhat compile
 * 6. npx hardhat run deploy.ts --network cronosTestnet
 */

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Cronos Testnet
    cronosTestnet: {
      url: "https://evm-t3.cronos.org/",
      chainId: 338,
      accounts: [PRIVATE_KEY],
      gasPrice: 5000000000000, // 5000 gwei
    },
    // Cronos Mainnet (for future deployment)
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
      cronosTestnet: process.env.CRONOS_API_KEY || "",
    },
    customChains: [
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

export default config;
