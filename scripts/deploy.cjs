const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🏔️  Starting NazdeekiX deployment on Avalanche Fuji...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "AVAX");
    
    if (balance.lt(ethers.utils.parseEther("1"))) {
        console.log("⚠️  Low balance! Get AVAX from https://faucet.avax.network/");
    }
    
    const deployedContracts = {};
    
    try {
        // Deploy NazdeekiCore
        console.log("\n📋 Deploying NazdeekiCore...");
        const NazdeekiCore = await ethers.getContractFactory("NazdeekiCore");
        const nazdeekiCore = await NazdeekiCore.deploy();
        await nazdeekiCore.deployed();
        
        deployedContracts.NazdeekiCore = nazdeekiCore.address;
        console.log("✅ NazdeekiCore deployed at:", nazdeekiCore.address);
        console.log("   Transaction hash:", nazdeekiCore.deployTransaction.hash);
        
        // Deploy FoodToken
        console.log("\n🪙 Deploying FoodToken...");
        const FoodToken = await ethers.getContractFactory("FoodToken");
        const foodToken = await FoodToken.deploy();
        await foodToken.deployed();
        
        deployedContracts.FoodToken = foodToken.address;
        console.log("✅ FoodToken deployed at:", foodToken.address);
        console.log("   Transaction hash:", foodToken.deployTransaction.hash);
        
        // Deploy NazdeekiPaymaster
        console.log("\n💰 Deploying NazdeekiPaymaster...");
        const NazdeekiPaymaster = await ethers.getContractFactory("NazdeekiPaymaster");
        const paymaster = await NazdeekiPaymaster.deploy();
        await paymaster.deployed();
        
        deployedContracts.NazdeekiPaymaster = paymaster.address;
        console.log("✅ NazdeekiPaymaster deployed at:", paymaster.address);
        console.log("   Transaction hash:", paymaster.deployTransaction.hash);
        
        // Setup initial configuration
        console.log("\n⚙️  Setting up initial configuration...");
        
        // Authorize paymaster as agent
        const authTx = await nazdeekiCore.authorizeAgent(paymaster.address);
        await authTx.wait();
        console.log("✅ Paymaster authorized as agent");
        
        // Fund paymaster with some AVAX for gas sponsoring
        const fundTx = await deployer.sendTransaction({
            to: paymaster.address,
            value: ethers.utils.parseEther("0.1") // 0.1 AVAX
        });
        await fundTx.wait();
        console.log("✅ Paymaster funded with 0.1 AVAX");
        
        // Save deployment info
        const deploymentInfo = {
            network: "avalanche-fuji",
            chainId: 43113,
            timestamp: new Date().toISOString(),
            deployer: deployer.address,
            contracts: deployedContracts,
            blockNumbers: {
                NazdeekiCore: nazdeekiCore.deployTransaction.blockNumber,
                FoodToken: foodToken.deployTransaction.blockNumber,
                NazdeekiPaymaster: paymaster.deployTransaction.blockNumber
            }
        };
        
        fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
        
        // Update .env file
        const envUpdates = `
# Smart Contract Addresses - Deployed on ${new Date().toISOString()}
NAZDEEKI_CORE_CONTRACT=${nazdeekiCore.address}
FOOD_TOKEN_CONTRACT=${foodToken.address}
PAYMASTER_CONTRACT=${paymaster.address}

# Block Numbers
NAZDEEKI_CORE_BLOCK=${nazdeekiCore.deployTransaction.blockNumber}
FOOD_TOKEN_BLOCK=${foodToken.deployTransaction.blockNumber}
PAYMASTER_BLOCK=${paymaster.deployTransaction.blockNumber}
`;
        
        fs.appendFileSync('.env', envUpdates);
        
        console.log("\n🎉 Deployment completed successfully!");
        console.log("=" * 60);
        console.log("NETWORK: Avalanche Fuji Testnet");
        console.log("CHAIN_ID: 43113");
        console.log("DEPLOYER:", deployer.address);
        console.log("=" * 60);
        console.log("CONTRACT ADDRESSES:");
        console.log(`NazdeekiCore: ${nazdeekiCore.address}`);
        console.log(`FoodToken: ${foodToken.address}`);
        console.log(`NazdeekiPaymaster: ${paymaster.address}`);
        console.log("=" * 60);
        console.log("🔍 Verify on Snowtrace:");
        console.log(`https://testnet.snowtrace.io/address/${nazdeekiCore.address}`);
        console.log(`https://testnet.snowtrace.io/address/${foodToken.address}`);
        console.log(`https://testnet.snowtrace.io/address/${paymaster.address}`);
        console.log("=" * 60);
        
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
