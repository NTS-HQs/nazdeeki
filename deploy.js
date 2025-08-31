// deploy.js (Fixed for ethers.js v6)
import pkg from 'hardhat';
const { ethers } = pkg;
import fs from 'fs';
import { config } from "dotenv";

config(); // Load environment variables

async function main() {
    console.log("🏔️  Starting NazdeekiX deployment on Avalanche Fuji...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // ✅ FIXED: Use provider.getBalance(deployer) instead of deployer.getBalance()
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "AVAX");
    
    if (balance < ethers.parseEther("1")) {
        console.log("⚠️  Low balance! Get AVAX from https://faucet.avax.network/");
    }
    
    const deployedContracts = {};
    
    try {
        // Deploy NazdeekiCore
        console.log("\n📋 Deploying NazdeekiCore...");
        const NazdeekiCore = await ethers.getContractFactory("NazdeekiCore");
        const nazdeekiCore = await NazdeekiCore.deploy();
        await nazdeekiCore.waitForDeployment(); // ✅ FIXED: waitForDeployment() instead of deployed()
        
        deployedContracts.NazdeekiCore = await nazdeekiCore.getAddress(); // ✅ FIXED: getAddress() instead of .address
        console.log("✅ NazdeekiCore deployed at:", deployedContracts.NazdeekiCore);
        console.log("   Transaction hash:", nazdeekiCore.deploymentTransaction().hash);
        
        // Deploy FoodToken
        console.log("\n🪙 Deploying FoodToken...");
        const FoodToken = await ethers.getContractFactory("FoodToken");
        const foodToken = await FoodToken.deploy();
        await foodToken.waitForDeployment();
        
        deployedContracts.FoodToken = await foodToken.getAddress();
        console.log("✅ FoodToken deployed at:", deployedContracts.FoodToken);
        console.log("   Transaction hash:", foodToken.deploymentTransaction().hash);
        
        // Deploy NazdeekiPaymaster
        console.log("\n💰 Deploying NazdeekiPaymaster...");
        const NazdeekiPaymaster = await ethers.getContractFactory("NazdeekiPaymaster");
        const paymaster = await NazdeekiPaymaster.deploy();
        await paymaster.waitForDeployment();
        
        deployedContracts.NazdeekiPaymaster = await paymaster.getAddress();
        console.log("✅ NazdeekiPaymaster deployed at:", deployedContracts.NazdeekiPaymaster);
        console.log("   Transaction hash:", paymaster.deploymentTransaction().hash);
        
        // Save deployment info
        const deploymentInfo = {
            network: "avalanche-fuji",
            chainId: 43113,
            timestamp: new Date().toISOString(),
            deployer: deployer.address,
            contracts: deployedContracts
        };
        
        fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
        
        // Update .env file
        const envUpdates = "\n# Smart Contract Addresses - Deployed on " + new Date().toISOString() + "\n" +
            "NAZDEEKI_CORE_CONTRACT=" + deployedContracts.NazdeekiCore + "\n" +
            "FOOD_TOKEN_CONTRACT=" + deployedContracts.FoodToken + "\n" +
            "PAYMASTER_CONTRACT=" + deployedContracts.NazdeekiPaymaster + "\n";
        
        fs.appendFileSync('.env', envUpdates);
        
        console.log("\n🎉 Deployment completed successfully!");
        console.log("============================================================");
        console.log("NETWORK: Avalanche Fuji Testnet");
        console.log("CHAIN_ID: 43113");
        console.log("DEPLOYER:", deployer.address);
        console.log("============================================================");
        console.log("CONTRACT ADDRESSES:");
        console.log("NazdeekiCore:", deployedContracts.NazdeekiCore);
        console.log("FoodToken:", deployedContracts.FoodToken);
        console.log("NazdeekiPaymaster:", deployedContracts.NazdeekiPaymaster);
        console.log("============================================================");
        console.log("🔍 Verify on Snowtrace:");
        console.log("https://testnet.snowtrace.io/address/" + deployedContracts.NazdeekiCore);
        console.log("https://testnet.snowtrace.io/address/" + deployedContracts.FoodToken);
        console.log("https://testnet.snowtrace.io/address/" + deployedContracts.NazdeekiPaymaster);
        console.log("============================================================");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

main()
    .then(() => {
        console.log("✅ All contracts deployed and configured!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Deployment failed:", error);
        process.exit(1);
    });
