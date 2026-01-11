const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🚀 AGENTMARKET FINAL DEPLOYMENT");
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("   User:", deployer.address);
  console.log("   Balance:", hre.ethers.formatEther(balance));

  // Network Fee Analysis
  const feeData = await hre.ethers.provider.getFeeData();
  // Very small buffer (105%) to fit in budget
  const gasPrice = feeData.gasPrice ? (feeData.gasPrice * 105n) / 100n : undefined;
  
  // Strict Limit: 6M gas. At 3000gwei this is ~18 TCRO. You have ~19.5. This should pass.
  const deployOptions = {
    gasLimit: 6000000, 
    gasPrice: gasPrice
  };

  console.log("📦 Deploying...");
  const AgentMarket = await hre.ethers.getContractFactory("AgentMarket");
  // NO ARGUMENTS PASSED HERE
  const agentMarket = await AgentMarket.deploy(deployOptions);
    
  console.log("⏳ Waiting...");
  await agentMarket.waitForDeployment();

  const address = await agentMarket.getAddress();
  console.log("\n✅ VICTORY! Contract:", address);
  
  // Config Update
  const configPath = path.join(__dirname, "../../src/config/contract.ts");
  try {
    if (fs.existsSync(configPath)) {
        let content = fs.readFileSync(configPath, "utf8");
        content = content.replace(/agentMarket: '0x[a-fA-F0-9]+'/, `agentMarket: '${address}'`);
        content = content.replace(/treasury: '0x[a-fA-F0-9]+'/, `treasury: '${deployer.address}'`);
        fs.writeFileSync(configPath, content);
        console.log("📝 Config updated.");
    }
  } catch (e) {}
}
main().catch((error) => { console.error(error); process.exit(1); });
