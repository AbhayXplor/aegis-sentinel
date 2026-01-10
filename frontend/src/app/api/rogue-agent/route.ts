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
const PRIVATE_KEY = process.env.ROGUE_AGENT_PRIVATE_KEY;

if (!PRIVATE_KEY || PRIVATE_KEY.length !== 66) { // Basic length check for 0x + 64 hex chars
    console.error("Configuration Error: ROGUE_AGENT_PRIVATE_KEY is missing or invalid.");
}

const RPC_URLS = [
    "https://rpc.ankr.com/eth_sepolia",
    "https://1rpc.io/sepolia",
    "https://ethereum-sepolia-rpc.publicnode.com"
];

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

        // 2. Setup Wallet with Fallback RPC
        let provider;
        for (const rpc of RPC_URLS) {
            try {
                provider = new ethers.JsonRpcProvider(rpc);
                await provider.getNetwork(); // Test connection
                break;
            } catch (e) {
                console.warn(`RPC ${rpc} failed, trying next...`);
            }
        }
        if (!provider) throw new Error("All RPCs failed");

        if (!PRIVATE_KEY) {
            throw new Error("Server Configuration Error: ROGUE_AGENT_PRIVATE_KEY is missing.");
        }
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

                // 1. PREDICT (Instant Feedback)
                try {
                    await aegis.execute.staticCall(MNEE_ADDRESS, data);
                    // If it doesn't revert, it MIGHT be success, but we check for events in static call result if possible.
                    // However, PolicyViolation is an event, not a revert.
                    // For the hackathon demo, if it's an attack and doesn't revert, we assume it went through (Warning).
                    status = 'SUCCESS';
                    analysis = 'Warning: Unauthorized transfer succeeded. No guardrails active.';
                } catch (e: any) {
                    // If it reverts, it's definitely blocked? No, Aegis catches errors.
                    // Actually, Aegis emits PolicyViolation.
                    // Let's rely on the fact that we can't easily read events from staticCall without a trace.
                    // OPTIMIZATION: Just assume it works for the UI speed, but send real tx.
                    // BETTER: We know the policy state. If we want to simulate "BLOCKED", we can check if the recipient is whitelisted.
                    // BUT, for the demo to be accurate to the contract, we should rely on the contract.

                    // FAST PATH: Send tx without waiting.
                }

                // FIRE AND FORGET
                const tx = await aegis.execute(MNEE_ADDRESS, data);
                txHash = tx.hash; // Instant hash

                // PREDICTION BASED ON KNOWN STATE (Simulated "Instant" Audit)
                // In a real app, we'd index the policy. Here, we guess based on the recipient.
                // If it's an attack recipient, and we know we have policies, it SHOULD be blocked.
                // But we don't know if the user enabled the policy yet.
                // TRICK: We can wait for 1 confirmation in the background, but return "PENDING" to UI?
                // User wants "BLOCKED" immediately.

                // Let's use a heuristic: If we are in "ATTACK" mode, and we know it's a bad address,
                // we can say "BLOCKED" if we assume the policy is active.
                // But that's fake.

                // REAL SOLUTION: Wait for 1 confirmation? No, too slow.
                // We will return "PENDING" and let the UI update via Supabase subscription when it confirms?
                // The UI listens to Supabase. So we can just return success here, and update Supabase LATER.

                // Plan:
                // 1. Return 200 OK immediately with "Processing".
                // 2. Continue execution in background (Edge functions might kill this, but Node runtime won't).
                // 3. Wait for tx, then update Supabase.

                // Since this is a Next.js API route, we can't easily fire-and-forget without it being killed.
                // BUT, we can try `waitUntil` or just hope it stays alive for 15s.
                // OR, we just wait for the tx.wait() but optimize the RPC to be faster? No, block time is fixed.

                // REVISED PLAN:
                // We MUST wait for the result to know if it was blocked.
                // The user says "1+ min". Sepolia is 12s. 1 min means RPC is retrying or hanging.
                // The RPC fallback I added should help.
                // Maybe the "staticCall" is the way.

                // Let's try staticCall again.
                // If we use `callStatic`, we get the return value of `execute`.
                // `execute` returns `bytes`.
                // If PolicyViolation is emitted, the transaction succeeds but emits an event.
                // We can't see events in staticCall easily.

                // ALTERNATIVE:
                // We just send the TX. We return the hash.
                // We insert a "PENDING" record into Supabase.
                // We have a separate "Indexer" or "Listener" that updates the status? No, too complex.

                // LET'S DO THIS:
                // 1. Send TX. Get Hash.
                // 2. Return Hash immediately.
                // 3. Insert "PENDING" into Supabase.
                // 4. The Frontend "ActivityFeed" sees "PENDING".
                // 5. We need a way to update it.

                // Actually, the user wants to see "BLOCKED" fast.
                // If we can't get it fast from chain, we simulate it.
                // We can read the `checkPolicy` view function if we had one.
                // We don't.

                // OK, we will use the "Fire and Forget" with a background promise.
                // Next.js App Router supports this pattern somewhat.

                const txResponse = await aegis.execute(MNEE_ADDRESS, data);
                txHash = txResponse.hash;

                // Log PENDING immediately so UI sees it
                await supabase.from('transactions').insert({
                    tx_hash: txHash,
                    target: MNEE_ADDRESS,
                    recipient: recipient,
                    function_selector: selector,
                    status: 'PENDING',
                    ai_analysis: 'Broadcasting transaction...',
                    value: value,
                    is_simulated: true
                });

                // Background processing (don't await this)
                (async () => {
                    try {
                        console.log(`Waiting for tx ${txHash}...`);
                        const receipt = await txResponse.wait(1);
                        const violation = receipt.logs.find((log: any) => {
                            try { return aegis.interface.parseLog(log)?.name === 'PolicyViolation'; } catch { return false; }
                        });

                        const finalStatus = violation ? 'BLOCKED' : 'SUCCESS';
                        const finalAnalysis = violation
                            ? 'Critical: Unauthorized MNEE transfer attempt to blacklisted wallet.'
                            : 'Warning: Unauthorized transfer succeeded. No guardrails active.';

                        await supabase.from('transactions')
                            .update({ status: finalStatus, ai_analysis: finalAnalysis })
                            .eq('tx_hash', txHash);
                    } catch (err) {
                        console.error("Background Tx Error", err);
                    }
                })();

                // Return immediately
                return NextResponse.json({ status: 'PENDING', txHash, analysis: 'Transaction broadcasted...' });

            } else {
                // Valid Transaction Logic (Same Fire & Forget)
                const randomTarget = VALID_TARGETS[Math.floor(Math.random() * VALID_TARGETS.length)];
                recipient = randomTarget;
                const baseAmount = customAmount ? parseFloat(customAmount) : 5;
                const randomizedAmount = (baseAmount * (0.8 + Math.random() * 0.4)).toFixed(2);
                value = randomizedAmount;

                let data;
                if (recipient === "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D") {
                    target = recipient;
                    selector = "0x38ed1739";
                    data = selector + "0000000000000000000000000000000000000000000000000000000000000000";
                } else {
                    target = MNEE_ADDRESS;
                    const amount = ethers.parseUnits(randomizedAmount, 18);
                    data = mnee.interface.encodeFunctionData("transfer", [recipient, amount]);
                    selector = data.slice(0, 10);
                }

                const txResponse = await aegis.execute(target, data);
                txHash = txResponse.hash;

                // Log PENDING immediately
                await supabase.from('transactions').insert({
                    tx_hash: txHash,
                    target: target,
                    recipient: recipient,
                    function_selector: selector,
                    status: 'PENDING',
                    ai_analysis: 'Broadcasting transaction...',
                    value: value,
                    is_simulated: true
                });

                (async () => {
                    try {
                        console.log(`Waiting for tx ${txHash}...`);
                        const receipt = await txResponse.wait(1);
                        const violation = receipt.logs.find((log: any) => {
                            try { return aegis.interface.parseLog(log)?.name === 'PolicyViolation'; } catch { return false; }
                        });

                        const finalStatus = violation ? 'BLOCKED' : 'SUCCESS';
                        const finalAnalysis = violation
                            ? `Policy Block: ${KNOWN_ENTITIES[recipient] || 'Service'} payment requires explicit approval.`
                            : `Authorized: Payment to ${KNOWN_ENTITIES[recipient] || 'Service'} confirmed.`;

                        await supabase.from('transactions')
                            .update({ status: finalStatus, ai_analysis: finalAnalysis })
                            .eq('tx_hash', txHash);
                    } catch (err) {
                        console.error("Background Tx Error", err);
                    }
                })();

                return NextResponse.json({ status: 'PENDING', txHash, analysis: 'Transaction broadcasted...' });
            }
        } catch (error: any) {
            console.error("Tx Error:", error);
            // If broadcast failed, we return error
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 4. Log to Supabase (Handled in background now)
        // if (txHash || status === 'ERROR') { ... }

        return NextResponse.json({ status, txHash, analysis });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
