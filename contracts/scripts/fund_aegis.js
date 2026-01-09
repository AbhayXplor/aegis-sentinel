const hre = require("hardhat");

async function main() {
    // Addresses from recent deployment
    const aegisAddress = "0xC534d9923eA8fFE1A1e117352c1dE6c61F31e095";
    const mneeAddress = "0x469470675401b92f1D7f1e83B4660FE51026746e";

    console.log("Funding AegisGuard at:", aegisAddress);

    const mnee = await hre.ethers.getContractAt("MockMNEE", mneeAddress);
    const amount = hre.ethers.parseUnits("10000", 18); // 10,000 MNEE

    console.log("Minting 10,000 MNEE to AegisGuard...");
    const tx = await mnee.mint(aegisAddress, amount);
    await tx.wait();

    const newBalance = await mnee.balanceOf(aegisAddress);
    console.log("Success! AegisGuard Balance:", hre.ethers.formatUnits(newBalance, 18), "MNEE");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
