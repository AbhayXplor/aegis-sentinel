const { ethers } = require("ethers");

const MNEE_ABI = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

const MNEE_ADDRESS = "0x469470675401b92f1D7f1e83B4660FE51026746e";
const AEGIS_ADDRESS = "0xC534d9923eA8fFE1A1e117352c1dE6c61F31e095";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    console.log(`Checking balance for AegisGuard: ${AEGIS_ADDRESS}`);
    console.log(`Token: ${MNEE_ADDRESS}`);

    try {
        const mnee = new ethers.Contract(MNEE_ADDRESS, MNEE_ABI, provider);
        const balance = await mnee.balanceOf(AEGIS_ADDRESS);
        const decimals = await mnee.decimals();

        console.log(`AegisGuard MNEE Balance: ${ethers.formatUnits(balance, decimals)}`);
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
}

main().catch(console.error);
