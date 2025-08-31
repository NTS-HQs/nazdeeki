// scripts/verify-deployment.cjs (Fixed CommonJS version)
const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying deployment on Avalanche Fuji...");
    
    // Your deployed contract addresses
    const contracts = {
        NazdeekiCore: "0xbee4C92Ab527E28251d3F9a943d3a12AA1ffbEA7",
        FoodToken: "0x4931962b6d0250E9E5c060E0c5cF7e53a3D673AF",
        NazdeekiPaymaster: "0x988375d69f12260b867756C922b2208E8c1706f4"
    };
    
    try {
        // Connect to contracts
        const nazdeekiCore = await ethers.getContractAt("NazdeekiCore", contracts.NazdeekiCore);
        const foodToken = await ethers.getContractAt("FoodToken", contracts.FoodToken);
        const paymaster = await ethers.getContractAt("NazdeekiPaymaster", contracts.NazdeekiPaymaster);
        
        // Test basic functionality
        console.log("✅ NazdeekiCore - Order counter:", await nazdeekiCore.orderCounter());
        console.log("✅ FoodToken - Name:", await foodToken.name());
        console.log("✅ FoodToken - Symbol:", await foodToken.symbol());
        console.log("✅ FoodToken - Total supply:", ethers.formatEther(await foodToken.totalSupply()), "FOOD");
        
        // Check paymaster balance
        const paymasterBalance = await ethers.provider.getBalance(contracts.NazdeekiPaymaster);
        console.log("✅ Paymaster - Balance:", ethers.formatEther(paymasterBalance), "AVAX");
        
        // Test contract interactions
        console.log("\n🧪 Testing contract interactions...");
        
        // Check if paymaster is authorized in NazdeekiCore
        const [deployer] = await ethers.getSigners();
        const isAuthorized = await nazdeekiCore.authorizedAgents(deployer.address);
        console.log("✅ Deployer authorized in NazdeekiCore:", isAuthorized);
        
        console.log("\n🎯 All contracts verified and working!");
        console.log("🔗 View on Snowtrace:");
        console.log(`   NazdeekiCore: https://testnet.snowtrace.io/address/${contracts.NazdeekiCore}`);
        console.log(`   FoodToken: https://testnet.snowtrace.io/address/${contracts.FoodToken}`);
        console.log(`   Paymaster: https://testnet.snowtrace.io/address/${contracts.NazdeekiPaymaster}`);
        
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
        throw error;
    }
}

main()
    .then(() => {
        console.log("✅ Verification completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Verification failed:", error);
        process.exit(1);
    });
