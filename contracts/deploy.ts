/**
 * AgentMarket Contract Deployment Script
 * 
 * Deploy to Cronos Testnet using Hardhat:
 * 
 * 1. Install dependencies:
 *    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
 * 
 * 2. Create hardhat.config.ts:
 *    
 *    import { HardhatUserConfig } from "hardhat/config";
 *    import "@nomicfoundation/hardhat-toolbox";
 *    
 *    const config: HardhatUserConfig = {
 *      solidity: "0.8.20",
 *      networks: {
 *        cronosTestnet: {
 *          url: "https://evm-t3.cronos.org/",
 *          chainId: 338,
 *          accounts: [process.env.PRIVATE_KEY!],
 *        },
 *      },
 *    };
 *    
 *    export default config;
 * 
 * 3. Set environment variable:
 *    export PRIVATE_KEY=your_wallet_private_key
 * 
 * 4. Run deployment:
 *    npx hardhat run contracts/deploy.ts --network cronosTestnet
 */

import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying AgentMarket with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Use deployer as treasury for testnet
  const treasury = deployer.address;
  
  // Deploy the contract
  const AgentMarket = await ethers.getContractFactory("AgentMarket");
  const agentMarket = await AgentMarket.deploy(treasury);
  
  await agentMarket.waitForDeployment();
  
  const contractAddress = await agentMarket.getAddress();
  
  console.log("\n========================================");
  console.log("AgentMarket deployed successfully!");
  console.log("========================================");
  console.log("Contract Address:", contractAddress);
  console.log("Treasury Address:", treasury);
  console.log("Network: Cronos Testnet (Chain ID: 338)");
  console.log("Explorer: https://explorer.cronos.org/testnet/address/" + contractAddress);
  console.log("\n========================================");
  console.log("NEXT STEPS:");
  console.log("========================================");
  console.log("1. Update src/config/contract.ts with:");
  console.log(`   addresses: {`);
  console.log(`     agentMarket: "${contractAddress}",`);
  console.log(`     treasury: "${treasury}",`);
  console.log(`   }`);
  console.log("========================================\n");

  // Verify deployment
  const protocolStats = await agentMarket.getProtocolStats();
  console.log("Initial Protocol Stats:");
  console.log("  Total Agents:", protocolStats[0].toString());
  console.log("  Active Agents:", protocolStats[1].toString());
  console.log("  Total Volume:", protocolStats[2].toString(), "wei");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
