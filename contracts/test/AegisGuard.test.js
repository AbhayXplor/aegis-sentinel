const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AegisGuard", function () {
    let aegis;
    let owner, agent, hacker;
    let mockTarget;

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
        const MockTargetFactory = await ethers.getContractFactory("AegisGuard");
        mockTarget = await MockTargetFactory.deploy(owner.address);
    });

    it("Should set the correct owner and agent", async function () {
        expect(await aegis.owner()).to.equal(owner.address);
        expect(await aegis.agent()).to.equal(agent.address);
    });

    it("Should allow owner to set policy", async function () {
        await aegis.setPolicy(mockTarget.target, TRANSFER_SELECTOR, true);
        // Note: allowedSelectors is a mapping, in JS we access it as a function
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
        const payload = TRANSFER_SELECTOR + "000000000000000000000000" + agent.address.slice(2);

        try {
            await aegis.connect(agent).execute(mockTarget.target, payload);
        } catch (error) {
            expect(error.message).to.not.include("Policy Violation");
        }
    });
});
