"use client";

import { useState } from "react";
import { Wallet, ShieldCheck, AlertTriangle, Coins, Plus, Building2, User } from "lucide-react";
import { motion } from "framer-motion";

interface WalletStatusProps {
    balance: string;
    ethBalance?: string;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    securityScore?: number;
    isScanning?: boolean;
    address?: string;
    isConnected?: boolean;
    isRealMode?: boolean;
    vaultBalance?: string;
}

export function WalletStatus({
    balance,
    ethBalance = "0.00",
    riskLevel,
    securityScore = 85,
    isScanning = false,
    address = "Not Connected",
    isConnected = false,
    isRealMode = false,
    vaultBalance = "0.00"
}: WalletStatusProps) {
    const [viewMode, setViewMode] = useState<"WALLET" | "VAULT">("WALLET");

    // Determine which balance to show
    const displayBalance = viewMode === "WALLET" ? balance : vaultBalance;
    const displayLabel = viewMode === "WALLET" ? "Wallet Balance" : "Vault Reserves";
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="enterprise-card p-5 relative overflow-hidden"
        >
            {/* Mode Badge */}
            <div className="absolute top-0 right-0">
                <div className={`px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.2em] rounded-bl-lg ${isRealMode ? 'bg-emerald-500/20 text-emerald-400 border-l border-b border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-l border-b border-blue-500/30'}`}>
                    {isRealMode ? 'Production' : 'Development'}
                </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                    {viewMode === "WALLET" ? <Wallet className="w-3 h-3 text-zinc-400" /> : <Building2 className="w-3 h-3 text-zinc-400" />}
                    {viewMode === "WALLET" ? "Connected Wallet" : "Aegis Vault"}
                </h2>

                <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
                    <button
                        onClick={() => setViewMode("WALLET")}
                        className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-md transition-all ${viewMode === "WALLET" ? "bg-blue-500 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Wallet
                    </button>
                    <button
                        onClick={() => setViewMode("VAULT")}
                        className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-md transition-all ${viewMode === "VAULT" ? "bg-emerald-500 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Vault
                    </button>
                </div>
            </div>

            {/* Balance Section */}
            <div className="mb-6">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white tracking-tighter">
                        {parseFloat(displayBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs font-black tracking-widest ${isRealMode ? 'text-emerald-500' : 'text-blue-500'}`}>MNEE</span>
                </div>
                <div className="text-[9px] text-zinc-500 mt-1 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    ≈ {ethBalance} ETH (Gas)
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                {!isRealMode && (
                    <button
                        onClick={async () => {
                            try {
                                const { mintMNEE } = await import("@/lib/blockchain");
                                const mneeAddress = process.env.NEXT_PUBLIC_MNEE_ADDRESS;
                                if (!mneeAddress) return alert("MNEE Address missing");

                                const success = await mintMNEE(mneeAddress, "1000"); // Mint 1000 tokens
                                if (success) alert("Minted 1,000 MNEE! Please wait for confirmation.");
                            } catch (e) {
                                console.error(e);
                                alert("Minting failed.");
                            }
                        }}
                        disabled={!isConnected}
                        className="flex items-center justify-center gap-1.5 px-2 py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg border border-white/10 transition-all disabled:opacity-30 active:scale-95"
                    >
                        <Coins className="w-3 h-3" /> Mint
                    </button>
                )}

                <button
                    onClick={async () => {
                        try {
                            const { addTokenToWallet } = await import("@/lib/blockchain");
                            const mneeAddress = isRealMode
                                ? "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF"
                                : process.env.NEXT_PUBLIC_MNEE_ADDRESS;

                            if (mneeAddress) await addTokenToWallet(mneeAddress, "MNEE", 18, isRealMode);
                        } catch (e) {
                            console.error(e);
                        }
                    }}
                    disabled={!isConnected}
                    className={`${isRealMode ? 'col-span-2' : ''} flex items-center justify-center gap-1.5 px-2 py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg border border-white/10 transition-all disabled:opacity-30 active:scale-95`}
                >
                    <Plus className="w-3 h-3" /> {isRealMode ? 'Add Real' : 'Add Test'}
                </button>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px]">
                <div className="text-zinc-500 font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-1 h-1 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                    <span className="text-zinc-400 font-medium">{isConnected ? 'Connected' : 'Offline'}</span>
                </div>
            </div>
        </motion.div>
    );
}
