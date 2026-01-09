import { expect } from "chai";
import { ethers } from "hardhat";
import { AegisGuard } from "../typechain-types";

describe("AegisGuard", function () {
    let aegis: AegisGuard;
    let owner: any;
    let agent: any;
    let hacker: any;
    let mockTarget: any;

    // Mock function selector for "transfer(address,uint256)"
    const TRANSFER_SELECTOR = "0xa9059cbb";
    // Mock function selector for "approve(address,uint256)"
    const APPROVE_SELECTOR = "0x095ea7b3";

    beforeEach(async function () {
        [owner, agent, hacker] = await ethers.getSigners();

        // Deploy AegisGuard
        const AegisGuardFactory = await ethers.getContractFactory("AegisGuard");
        aegis = await AegisGuardFactory.deploy(agent.address);
        await aegis.waitForDeployment();

        // Deploy a Mock Target (just an address for now, or we can deploy a real mock)
        // For simplicity, we'll use a random address as target and mock the call success
        // But to test `call`, we need a contract that accepts calls.
        // Let's deploy a Greeter or similar as a mock target.
        const MockTargetFactory = await ethers.getContractFactory("AegisGuard"); // Reusing as mock for now
        mockTarget = await MockTargetFactory.deploy(owner.address);
    });

    it("Should set the correct owner and agent", async function () {
        expect(await aegis.owner()).to.equal(owner.address);
        expect(await aegis.agent()).to.equal(agent.address);
    });

    it("Should allow owner to set policy", async function () {
        await aegis.setPolicy(mockTarget.target, TRANSFER_SELECTOR, true);
        expect(await aegis.allowedSelectors(mockTarget.target, TRANSFER_SELECTOR)).to.be.true;
    });

    it("Should block agent from calling unauthorized function", async function () {
        // Agent tries to call 'approve' which is NOT allowed
        const payload = APPROVE_SELECTOR + "000000000000000000000000" + agent.address.slice(2);

        await expect(
            aegis.connect(agent).execute(mockTarget.target, payload)
        ).to.be.revertedWith("Aegis: Policy Violation - Function Not Allowed");
    });

    it("Should allow agent to call authorized function", async function () {
        // 1. Allow 'transfer'
        await aegis.setPolicy(mockTarget.target, TRANSFER_SELECTOR, true);

        // 2. Agent calls 'transfer'
        // Note: The call will fail internally in the mock target if it doesn't have the function,
        // but Aegis should NOT revert with "Policy Violation".
        // To test this properly, we need a Mock Contract that implements these functions or fallback.
        // For now, we expect it to NOT revert with "Policy Violation".
        // It might revert with "Aegis: Call Failed" if the target doesn't handle the call.

        const payload = TRANSFER_SELECTOR + "000000000000000000000000" + agent.address.slice(2);

        // We expect it to pass the policy check. 
        // If the target reverts, Aegis reverts with "Call Failed".
        // If we use a valid target (like itself), it might work.
        // Let's just check it doesn't revert with Policy Violation.

        try {
            await aegis.connect(agent).execute(mockTarget.target, payload);
        } catch (error: any) {
            expect(error.message).to.not.include("Policy Violation");
        }
    });
});
