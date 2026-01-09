const hre = require("hardhat");

async function main() {
    const mneeAddress = process.env.MNEE_ADDRESS || "0xE8Bc16B747bbc9988F47499D7857e7411773DfAB";
    const [deployer] = await hre.ethers.getSigners();

    console.log("Minting MNEE for:", deployer.address);
    console.log("Using MNEE Contract:", mneeAddress);

    const MockMNEE = await hre.ethers.getContractAt("MockMNEE", mneeAddress);

    // Mint 1000 MNEE (MNEE has 18 decimals in our mock)
    const amount = hre.ethers.parseUnits("1000", 18);

    try {
        const tx = await MockMNEE.mint(deployer.address, amount);
        await tx.wait();
        console.log("Successfully minted 1000 MNEE!");
        console.log("Transaction hash:", tx.hash);
    } catch (e) {
        console.error("Minting failed! Make sure you are using the correct MNEE address and have permissions.");
        console.error(e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
