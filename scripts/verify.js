const { ethers } = require("hardhat");

async function main() {
    const nazdeekiCore = await ethers.getContractAt("NazdeekiCore", process.env.NAZDEEKI_CORE_CONTRACT);
    const foodToken = await ethers.getContractAt("FoodToken", process.env.FOOD_TOKEN_CONTRACT);
    
    console.log("NazdeekiCore order counter:", await nazdeekiCore.orderCounter());
    console.log("FoodToken total supply:", ethers.utils.formatEther(await foodToken.totalSupply()));
    
    console.log("✅ All contracts are working!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
