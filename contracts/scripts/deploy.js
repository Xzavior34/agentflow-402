/**
 * AgentMarket Deployment Script
 * Deploy to Cronos zkEVM Testnet
 * 
 * Usage: npx hardhat run scripts/deploy.js --network cronosZkEvm
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║           🚀 AgentMarket Protocol Deployment                 ║");
  console.log("║                  Cronos zkEVM Testnet                        ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("\n");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log("📋 Deployment Configuration:");
  console.log("─────────────────────────────────────────────────────────────────");
  console.log(`   Network:      ${hre.network.name}`);
  console.log(`   Chain ID:     ${hre.network.config.chainId}`);
  console.log(`   Deployer:     ${deployer.address}`);
  console.log(`   Balance:      ${hre.ethers.formatEther(balance)} TCRO`);
  console.log("─────────────────────────────────────────────────────────────────\n");

  if (balance === 0n) {
    console.log("❌ ERROR: Deployer has no TCRO balance!");
    console.log("   Get testnet TCRO from: https://cronos.org/faucet");
    process.exit(1);
  }

  // Treasury address (deployer for now, can be changed)
  const treasuryAddress = deployer.address;
  console.log(`💰 Treasury Address: ${treasuryAddress}\n`);

  // Deploy AgentMarket
  console.log("📦 Deploying AgentMarket contract...\n");
  
  const AgentMarket = await hre.ethers.getContractFactory("AgentMarket");
  const agentMarket = await AgentMarket.deploy(treasuryAddress);

  console.log("⏳ Waiting for confirmation...\n");
  await agentMarket.waitForDeployment();

  const contractAddress = await agentMarket.getAddress();
  const deploymentTx = agentMarket.deploymentTransaction();

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║              ✅ DEPLOYMENT SUCCESSFUL!                       ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");
  
  console.log("📍 Contract Details:");
  console.log("─────────────────────────────────────────────────────────────────");
  console.log(`   Contract Address:  ${contractAddress}`);
  console.log(`   Transaction Hash:  ${deploymentTx?.hash}`);
  console.log(`   Gas Used:          ${deploymentTx?.gasLimit?.toString()}`);
  console.log("─────────────────────────────────────────────────────────────────\n");

  // Explorer links
  const explorerBase = hre.network.name === "cronosZkEvm" 
    ? "https://explorer.zkevm.cronos.org"
    : "https://testnet.cronoscan.com";

  console.log("🔗 Explorer Links:");
  console.log(`   Contract: ${explorerBase}/address/${contractAddress}`);
  console.log(`   TX:       ${explorerBase}/tx/${deploymentTx?.hash}\n`);

  // Update config file
  console.log("📝 Updating configuration...\n");
  
  const configPath = path.join(__dirname, "../../src/config/contract.ts");
  
  try {
    let configContent = fs.readFileSync(configPath, "utf8");
    
    // Update agentMarket address
    configContent = configContent.replace(
      /agentMarket: '0x[a-fA-F0-9]+'/,
      `agentMarket: '${contractAddress}'`
    );
    
    // Update treasury address
    configContent = configContent.replace(
      /treasury: '0x[a-fA-F0-9]+'/,
      `treasury: '${treasuryAddress}'`
    );

    // Update chain config for zkEVM if deploying there
    if (hre.network.name === "cronosZkEvm") {
      configContent = configContent.replace(
        /chainId: \d+/,
        "chainId: 240"
      );
      configContent = configContent.replace(
        /chainName: '[^']+'/,
        "chainName: 'Cronos zkEVM Testnet'"
      );
      configContent = configContent.replace(
        /rpcUrl: '[^']+'/,
        "rpcUrl: 'https://testnet.zkevm.cronos.org'"
      );
      configContent = configContent.replace(
        /explorerUrl: '[^']+'/,
        "explorerUrl: 'https://explorer.zkevm.cronos.org'"
      );
    }
    
    fs.writeFileSync(configPath, configContent);
    console.log("   ✅ src/config/contract.ts updated with new address!\n");
  } catch (error) {
    console.log("   ⚠️  Could not auto-update config. Please update manually:\n");
    console.log("   📄 File: src/config/contract.ts");
    console.log(`   📍 agentMarket: '${contractAddress}'`);
    console.log(`   📍 treasury: '${treasuryAddress}'\n`);
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contractAddress,
    treasuryAddress,
    deployer: deployer.address,
    txHash: deploymentTx?.hash,
    timestamp: new Date().toISOString(),
    explorerUrl: `${explorerBase}/address/${contractAddress}`,
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}-latest.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to: contracts/deployments/\n");

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                    🎉 NEXT STEPS                             ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log("║  1. Verify contract on explorer (optional)                   ║");
  console.log("║  2. Run seed script: npm run seed:market                     ║");
  console.log("║  3. Run simulation: npm run simulate                         ║");
  console.log("║  4. Test in browser at your Lovable URL                      ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
