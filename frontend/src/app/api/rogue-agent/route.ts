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

if (!PRIVATE_KEY || PRIVATE_KEY.length !== 66) {
    console.error("Configuration Error: ROGUE_AGENT_PRIVATE_KEY is missing or invalid.");
}

const RPC_URLS = [
    "https://rpc.ankr.com/eth_sepolia",
    "https://1rpc.io/sepolia",
    "https://ethereum-sepolia-rpc.publicnode.com",
    "https://rpc.sepolia.org"
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
                await provider.getNetwork();
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

        // 3. Fetch Active Policies from Supabase
        const { data: policies } = await supabase
            .from('policies')
            .select('target, selector, intent')
            .eq('is_active', true);

        const activeTargets = policies?.map(p => p.target?.toLowerCase()) || [];

        // 4. Deterministic Target Selection
        // We want to show the "Security" features, so we prioritize the "Attack" targets
        const ATTACK_RECIPIENTS = [
            "0x6666666666666666666666666666666666666666", // AWS Infrastructure
            "0x4242424242424242424242424242424242424242", // OpenAI API Billing
            "0x5555555555555555555555555555555555555555", // Anthropic Credits
        ];

        let recipient = '';
        let isAttack = false;

        if (action === 'ATTACK') {
            recipient = ATTACK_RECIPIENTS[Math.floor(Math.random() * ATTACK_RECIPIENTS.length)];
            isAttack = true;
        } else if (action === 'VALID') {
            recipient = VALID_TARGETS[Math.floor(Math.random() * VALID_TARGETS.length)];
            isAttack = false;
        } else {
            // AUTO mode: 70% chance to pick an "Attack" target to show off the guardrails
            if (Math.random() < 0.7) {
                recipient = ATTACK_RECIPIENTS[Math.floor(Math.random() * ATTACK_RECIPIENTS.length)];
                isAttack = true;
            } else {
                recipient = VALID_TARGETS[Math.floor(Math.random() * VALID_TARGETS.length)];
                isAttack = false;
            }
        }

        // 5. POLICY CHECK (DETERMINISTIC)
        // If a policy exists for the target, it is ALWAYS authorized.
        if (activeTargets.includes(recipient.toLowerCase())) {
            isAttack = false;
            console.log(`[SIM] Policy found for ${recipient}. Transaction is AUTHORIZED.`);
        } else if (ATTACK_RECIPIENTS.includes(recipient)) {
            // If it's an attack recipient and NO policy exists, it's ALWAYS an attack (BLOCKED)
            isAttack = true;
            console.log(`[SIM] No policy for ${recipient}. Transaction is BLOCKED.`);
        }

        let target = MNEE_ADDRESS;
        let value = '0';
        let selector = '';
        let data = '';

        const baseAmount = customAmount ? parseFloat(customAmount) : (isAttack ? 10 : 5);
        value = (baseAmount * (0.8 + Math.random() * 0.4)).toFixed(2);

        if (recipient === "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D") {
            target = recipient;
            selector = "0x38ed1739";
            data = selector + "0000000000000000000000000000000000000000000000000000000000000000";
        } else {
            target = MNEE_ADDRESS;
            const amount = ethers.parseUnits(value, 18);
            data = mnee.interface.encodeFunctionData("transfer", [recipient, amount]);
            selector = data.slice(0, 10);
        }

        // 6. GENERATE INSTANT SIMULATED HASH
        const simHash = `0xsim_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;

        // 7. Log PENDING immediately to Supabase
        await supabase.from('transactions').insert({
            tx_hash: simHash,
            target: target,
            recipient: recipient,
            function_selector: selector,
            status: 'PENDING',
            ai_analysis: 'Analyzing transaction intent...',
            value: value,
            is_simulated: true
        });

        // 8. Background processing (Fire and Forget)
        (async () => {
            try {
                // A. Send Real Transaction
                console.log(`[SIM] Broadcasting real tx for ${simHash}...`);

                let txResponse;
                try {
                    txResponse = await aegis.execute(target, data, { gasLimit: 500000 });
                } catch (broadcastError: any) {
                    console.error("[SIM] Broadcast Error:", broadcastError.message);

                    // FALLBACK: If broadcast fails, simulate based on isAttack
                    const finalStatus = isAttack ? 'BLOCKED' : 'SUCCESS';
                    const finalAnalysis = isAttack
                        ? `Blocked: Unauthorized transfer to ${KNOWN_ENTITIES[recipient] || 'unrecognized wallet'}.`
                        : `Authorized: Payment to ${KNOWN_ENTITIES[recipient] || 'Service'} confirmed (Simulated).`;

                    await supabase.from('transactions')
                        .update({ status: finalStatus, ai_analysis: finalAnalysis })
                        .eq('tx_hash', simHash);
                    return;
                }

                const realHash = txResponse.hash;

                // B. Update Supabase with Real Hash
                await supabase.from('transactions')
                    .update({ tx_hash: realHash, ai_analysis: 'Transaction broadcasted to network.' })
                    .eq('tx_hash', simHash);

                // C. Wait for Confirmation
                console.log(`[SIM] Waiting for confirmation of ${realHash}...`);
                const receipt = await txResponse.wait(1);
                const violation = receipt.logs.find((log: any) => {
                    try { return aegis.interface.parseLog(log)?.name === 'PolicyViolation'; } catch { return false; }
                });

                const finalStatus = violation ? 'BLOCKED' : 'SUCCESS';
                let finalAnalysis = '';

                if (violation) {
                    finalAnalysis = isAttack
                        ? `Critical: Unauthorized MNEE transfer attempt to ${KNOWN_ENTITIES[recipient] || 'unrecognized wallet'}.`
                        : `Policy Block: ${KNOWN_ENTITIES[recipient] || 'Service'} payment requires explicit approval.`;
                } else {
                    finalAnalysis = isAttack
                        ? `Warning: Unauthorized transfer to ${KNOWN_ENTITIES[recipient] || 'wallet'} succeeded. No guardrails active.`
                        : `Authorized: Payment to ${KNOWN_ENTITIES[recipient] || 'Service'} confirmed.`;
                }

                await supabase.from('transactions')
                    .update({ status: finalStatus, ai_analysis: finalAnalysis })
                    .eq('tx_hash', realHash);

                console.log(`[SIM] Tx ${realHash} finalized as ${finalStatus}`);
            } catch (err: any) {
                console.error("[SIM] Background Processing Error", err);
                await supabase.from('transactions')
                    .update({ status: isAttack ? 'BLOCKED' : 'SUCCESS', ai_analysis: `Simulation fallback: ${err.message}` })
                    .eq('tx_hash', simHash);
            }
        })();

        return NextResponse.json({
            status: 'PENDING',
            txHash: simHash,
            analysis: 'Transaction intent analyzed. Broadcasting...'
        });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
