import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { KNOWN_ENTITIES, VALID_TARGETS } from '@/lib/constants';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Contract Config
const AEGIS_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS!;
const MNEE_ADDRESS = process.env.NEXT_PUBLIC_MNEE_ADDRESS!;
const PRIVATE_KEY = process.env.ROGUE_AGENT_PRIVATE_KEY!;
const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com"; // Hardcoded for server-side reliability

const AEGIS_ABI = [
    "function execute(address target, bytes calldata data) external payable",
    "event PolicyViolation(address indexed target, bytes4 indexed selector, string reason, bytes data)",
    "event Executed(address indexed target, bytes4 indexed selector, uint256 value, bytes data)"
];

const MNEE_ABI = [
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)"
];

export async function POST(request: Request) {
    try {
        const { action, customAmount } = await request.json();

        // 1. Check Simulation State
        const { data: state } = await supabase
            .from('simulation_state')
            .select('is_running')
            .eq('id', 1)
            .single();

        if (!state?.is_running && action !== 'FORCE_RUN') {
            return NextResponse.json({ status: 'STOPPED', message: 'Simulation is not running' });
        }

        // 2. Setup Wallet
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const aegis = new ethers.Contract(AEGIS_ADDRESS, AEGIS_ABI, wallet);
        const mnee = new ethers.Contract(MNEE_ADDRESS, MNEE_ABI, wallet);

        // 3. Randomly Choose Attack or Valid (Favoring Valid 70/30 for better variety)
        const isAttack = action === 'ATTACK' ? true : (action === 'VALID' ? false : Math.random() < 0.3);

        let txHash = '';
        let status = 'PENDING';
        let analysis = '';
        let target = '';
        let recipient = '';
        let selector = '';
        let value = '0';

        try {
            if (isAttack) {
                // Attack: Unauthorized Transfer to Unknown Wallet
                target = MNEE_ADDRESS;

                const ATTACK_RECIPIENTS = [
                    "0x1234567890123456789012345678901234567890", // Unknown Wallet (Phishing)
                    "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef", // Blacklisted Mixer
                    "0x9999999999999999999999999999999999999999"  // Suspicious Address
                ];
                recipient = ATTACK_RECIPIENTS[Math.floor(Math.random() * ATTACK_RECIPIENTS.length)];

                const baseAmount = customAmount ? parseFloat(customAmount) : 10;
                const randomizedAmount = (baseAmount * (0.9 + Math.random() * 0.2)).toFixed(2);
                value = randomizedAmount;

                const amount = ethers.parseUnits(randomizedAmount, 18);
                const data = mnee.interface.encodeFunctionData("transfer", [recipient, amount]);
                selector = data.slice(0, 10);

                const tx = await aegis.execute(MNEE_ADDRESS, data);
                const receipt = await tx.wait();
                txHash = receipt.hash;

                const violation = receipt.logs.find((log: any) => {
                    try { return aegis.interface.parseLog(log)?.name === 'PolicyViolation'; } catch { return false; }
                });

                if (violation) {
                    status = 'BLOCKED';
                    analysis = 'Critical: Unauthorized MNEE transfer attempt to blacklisted wallet.';
                } else {
                    status = 'SUCCESS';
                    analysis = 'Warning: Unauthorized transfer succeeded. No guardrails active.';
                }

            } else {
                // Valid: Randomized Business Operation
                const randomTarget = VALID_TARGETS[Math.floor(Math.random() * VALID_TARGETS.length)];
                recipient = randomTarget;

                const baseAmount = customAmount ? parseFloat(customAmount) : 5;
                const randomizedAmount = (baseAmount * (0.8 + Math.random() * 0.4)).toFixed(2);
                value = randomizedAmount;

                if (recipient === "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D") {
                    target = recipient;
                    selector = "0x38ed1739"; // swapExactTokensForTokens
                    const data = selector + "0000000000000000000000000000000000000000000000000000000000000000";
                    const tx = await aegis.execute(target, data);
                    const receipt = await tx.wait();
                    txHash = receipt.hash;
                } else {
                    // Generic transfer for other services
                    target = MNEE_ADDRESS;
                    const amount = ethers.parseUnits(randomizedAmount, 18);
                    const data = mnee.interface.encodeFunctionData("transfer", [recipient, amount]);
                    selector = data.slice(0, 10);
                    const tx = await aegis.execute(MNEE_ADDRESS, data);
                    const receipt = await tx.wait();
                    txHash = receipt.hash;
                }

                const receipt = await provider.getTransactionReceipt(txHash);
                const violation = receipt?.logs.find((log: any) => {
                    try { return aegis.interface.parseLog(log)?.name === 'PolicyViolation'; } catch { return false; }
                });

                if (violation) {
                    status = 'BLOCKED';
                    analysis = `Policy Block: ${KNOWN_ENTITIES[recipient] || 'Service'} payment requires explicit approval.`;
                } else {
                    status = 'SUCCESS';
                    analysis = `Authorized: Payment to ${KNOWN_ENTITIES[recipient] || 'Service'} confirmed.`;
                }
            }
        } catch (error: any) {
            console.error("Tx Error:", error);
            status = 'ERROR';
            analysis = error.message || 'Transaction Failed';
        }

        // 4. Log to Supabase
        if (txHash || status === 'ERROR') {
            await supabase.from('transactions').insert({
                tx_hash: txHash || 'FAILED',
                target: target,
                recipient: recipient,
                function_selector: selector,
                status: status,
                ai_analysis: analysis,
                value: value,
                is_simulated: true
            });
        }

        return NextResponse.json({ status, txHash, analysis });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
