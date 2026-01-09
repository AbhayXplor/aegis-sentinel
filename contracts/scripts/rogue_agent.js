const hre = require("hardhat");

async function main() {
    const signers = await hre.ethers.getSigners();
    const owner = signers[0];
    // If only 1 account (e.g. Sepolia), use owner as agent. 
    // Since owner == agent in deployment, this works for policy enforcement too.
    const agent = signers.length > 1 ? signers[1] : owner;

    // Addresses from your deployment
    const AEGIS_ADDRESS = process.env.AEGIS_GUARD_ADDRESS;
    const MNEE_ADDRESS = process.env.MNEE_ADDRESS;
    const UNISWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Example target
    const UNKNOWN_TARGET = "0x1234567890123456789012345678901234567890";

    if (!AEGIS_ADDRESS || !MNEE_ADDRESS) {
        console.error("Please set AEGIS_GUARD_ADDRESS and MNEE_ADDRESS in .env");
        return;
    }

    const aegis = await hre.ethers.getContractAt("AegisGuard", AEGIS_ADDRESS);
    const mnee = await hre.ethers.getContractAt("MockMNEE", MNEE_ADDRESS);

    console.log("😈 Rogue Agent Started...");
    console.log(`Targeting Aegis at: ${AEGIS_ADDRESS}`);
    console.log(`Using Agent Wallet: ${agent.address}`);

    // Infinite loop of chaos
    while (true) {
        const isAttack = Math.random() < 0.5; // 50% chance of attack

        try {
            if (isAttack) {
                console.log("\n🔴 Attempting UNAUTHORIZED Transfer (Attack)...");
                // Try to transfer 1000 MNEE to unknown address
                const amount = hre.ethers.parseUnits("1000", 18);
                const data = mnee.interface.encodeFunctionData("transfer", [UNKNOWN_TARGET, amount]);

                const tx = await aegis.connect(agent).execute(MNEE_ADDRESS, data);
                const receipt = await tx.wait();

                // Check logs for PolicyViolation
                const violationEvent = receipt.logs.find(log => {
                    try {
                        const parsed = aegis.interface.parseLog(log);
                        return parsed && parsed.name === "PolicyViolation";
                    } catch (e) { return false; }
                });

                if (violationEvent) {
                    console.log("🛡️ BLOCKED BY AEGIS: Policy Violation (Event Emitted)");
                } else {
                    console.log("❌ ATTACK SUCCEEDED (This should not happen if policy is set!)");
                }
            } else {
                console.log("\n🟢 Attempting VALID Swap (Normal Behavior)...");
                // Try to call swap on Uniswap (assuming it's allowed)
                // Mocking a swap call data
                const selector = "0x38ed1739"; // swapExactTokensForTokens
                // Just sending random data matching selector length + params
                const data = selector + "0000000000000000000000000000000000000000000000000000000000000000";

                const tx = await aegis.connect(agent).execute(UNISWAP_ROUTER, data);
                const receipt = await tx.wait();

                // Check logs for PolicyViolation
                const violationEvent = receipt.logs.find(log => {
                    try {
                        const parsed = aegis.interface.parseLog(log);
                        return parsed && parsed.name === "PolicyViolation";
                    } catch (e) { return false; }
                });

                if (violationEvent) {
                    console.log("🛡️ BLOCKED BY AEGIS: Policy Violation (Event Emitted)");
                } else {
                    console.log("✅ VALID TRANSACTION EXECUTED");
                }
            }
        } catch (error) {
            console.log("⚠️ Transaction Failed:", error.message.split("revert")[0]);
        }

        // Wait 5 seconds
        await new Promise(r => setTimeout(r, 5000));
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
