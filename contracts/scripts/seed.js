const hre = require("hardhat");

async function main() {
  const contractAddress = "0x79E32be792330c28Fb97958075bE9cB9e528977e"; 
  console.log(`\n🌱 Seeding Market at: ${contractAddress}`);

  const AgentMarket = await hre.ethers.getContractFactory("AgentMarket");
  const market = AgentMarket.attach(contractAddress);
  const [deployer] = await hre.ethers.getSigners();

  console.log(`👤 User: ${deployer.address}`);

  // FIX: We must provide ALL fields matching the Solidity Struct,
  // even if the contract overwrites some of them internally.
  const agentProfile = {
    name: "AutoGPT-4 Turbo",
    endpointUrl: "https://api.agent-market.io/v1/agent/gpt4",
    capabilities: ["code-generation", "audit", "debugging"],
    mcpVersion: "1.0.0",
    // Dummy values required by Ethers.js to match the struct shape:
    walletAddress: deployer.address, 
    reputationScore: 0,
    registeredAt: 0,
    isActive: true
  };

  console.log("\n🤖 Registering Agent...");

  try {
    const isRegistered = await market.isRegistered(deployer.address);
    
    if (isRegistered) {
       console.log("   ⚠️  You are already registered! Skipping registration.");
    } else {
       const tx = await market.registerAgent(agentProfile);
       console.log("   ⏳ Sending transaction...");
       await tx.wait();
       console.log("   ✅ Success! Agent registered.");
    }
  } catch (error) {
    console.log(`   ❌ Registration Failed: ${error.message}`);
  }

  // 2. Simulate Hiring (Self-Hire to generate volume)
  console.log("\n💼 Simulating Job...");
  try {
    // 0.0001 TCRO
    const hireFee = hre.ethers.parseEther("0.0001"); 
    
    const tx = await market.hireAgent(deployer.address, { value: hireFee });
    await tx.wait();
    console.log("   ✅ Job Completed! Volume added to stats.");
  } catch (error) {
    console.log("   ⚠️  Job skipped (maybe you can't hire yourself?):", error.message);
  }

  console.log("\n🎉 Done! Go check the UI.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
