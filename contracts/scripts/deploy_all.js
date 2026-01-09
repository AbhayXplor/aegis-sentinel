const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy MockMNEE
    const MockMNEE = await hre.ethers.getContractFactory("MockMNEE");
    const mnee = await MockMNEE.deploy();
    await mnee.waitForDeployment();
    const mneeAddress = await mnee.getAddress();
    console.log("MockMNEE deployed to:", mneeAddress);

    // 2. Deploy AegisGuard
    const AegisGuard = await hre.ethers.getContractFactory("AegisGuard");
    const aegis = await AegisGuard.deploy(deployer.address);
    await aegis.waitForDeployment();
    const aegisAddress = await aegis.getAddress();
    console.log("AegisGuard deployed to:", aegisAddress);

    console.log("\n--- DEPLOYMENT COMPLETE ---");
    console.log("NEXT_PUBLIC_MNEE_ADDRESS=" + mneeAddress);
    console.log("NEXT_PUBLIC_AEGIS_GUARD_ADDRESS=" + aegisAddress);
    console.log("\nCopy these to your frontend/.env.local file!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
