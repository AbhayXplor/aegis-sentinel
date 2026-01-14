"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle, AlertTriangle, ChevronDown } from "lucide-react";
import { ethers } from "ethers";
import { TokenLogo } from "./TokenLogo";
import { REAL_TOKEN_ADDRESS, TOKEN_ABI, SUPPORTED_TOKENS } from "@/lib/constants";

// Helper to ensure network (duplicated from blockchain.ts to avoid circular deps or just import if possible)
// Better to import if exported. It is not exported in blockchain.ts, so I will add it or just use the public switchNetwork function.
import { switchNetwork } from "@/lib/blockchain";

export function RealPaymentControl() {
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [txHash, setTxHash] = useState("");

    const handlePayment = async () => {
        if (!recipient || !amount) return;
        setIsLoading(true);
        setStatus("idle");

        try {
            if (!window.ethereum) throw new Error("No wallet found");

            // Enforce Real Mode (Mainnet) since this is RealPaymentControl
            await switchNetwork(true);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(selectedToken.address, TOKEN_ABI, signer);
            const amountWei = ethers.parseUnits(amount, selectedToken.decimals);

            const tx = await contract.transfer(recipient, amountWei);
            await tx.wait();

            setTxHash(tx.hash);
            setStatus("success");
            setAmount("");
            setRecipient("");
        } catch (error) {
            console.error("Payment failed:", error);
            setStatus("error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Recipient Address</label>
                    <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount & Asset</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-4 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                            />
                        </div>
                        <div className="relative w-32">
                            <select
                                value={selectedToken.symbol}
                                onChange={(e) => {
                                    const token = SUPPORTED_TOKENS.find(t => t.symbol === e.target.value);
                                    if (token) setSelectedToken(token);
                                }}
                                className="w-full h-full appearance-none bg-slate-800 border border-white/10 rounded-lg pl-3 pr-8 text-sm text-white font-bold focus:outline-none focus:border-blue-500/50 cursor-pointer"
                            >
                                {SUPPORTED_TOKENS.map(token => (
                                    <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {status === "success" && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-emerald-400">Payment Sent!</p>
                        <p className="text-[10px] text-slate-400 font-mono break-all">{txHash}</p>
                    </div>
                </div>
            )}

            {status === "error" && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <p className="text-xs font-bold text-red-400">Transaction Failed</p>
                </div>
            )}

            <button
                onClick={handlePayment}
                disabled={isLoading || !recipient || !amount}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isLoading ? "Processing..." : `Send ${selectedToken.symbol}`}
            </button>
        </div>
    );
}
