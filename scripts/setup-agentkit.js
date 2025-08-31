const { ethers } = require("hardhat");

async function setupAgentKitIntegration() {
    const deploymentInfo = require('../deployment-info.json');
    
    console.log("🤖 Setting up AgentKit integration...");
    
    // This would integrate with 0xGasless AgentKit
    const agentKitConfig = {
        network: "avalanche-fuji",
        contracts: {
            nazdeekiCore: deploymentInfo.contracts.NazdeekiCore,
            foodToken: deploymentInfo.contracts.FoodToken,
            paymaster: deploymentInfo.contracts.NazdeekiPaymaster
        },
        gasless: true,
        paymaster: deploymentInfo.contracts.NazdeekiPaymaster
    };
    
    console.log("AgentKit Config:", JSON.stringify(agentKitConfig, null, 2));
    console.log("✅ AgentKit integration ready!");
    
    return agentKitConfig;
}

setupAgentKitIntegration().catch(console.error);
