"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Power, Play, Plus, Wallet, ShieldCheck } from "lucide-react";

interface WalletStatusProps {
    balance: string;
    ethBalance: string;
    address: string;
    riskLevel: string;
    isConnected: boolean;
    isRealMode: boolean;
    vaultBalance: string;
    isPaused: boolean;
    setIsPaused: (paused: boolean) => void;
    compact?: boolean;
}

export function WalletStatus({
    balance,
    ethBalance,
    address,
    riskLevel,
    isConnected,
    isRealMode,
    vaultBalance,
    isPaused,
    setIsPaused,
    compact = false
}: WalletStatusProps) {
    const [viewMode, setViewMode] = useState<"WALLET" | "VAULT">("WALLET");

    // Determine which balance to show
    const displayBalance = viewMode === "WALLET" ? balance : vaultBalance;
    const displayLabel = viewMode === "WALLET" ? "Wallet Balance" : "Vault Reserves";

    if (compact) {
        return (
            <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-900/50 border border-white/5 rounded-full backdrop-blur-sm">
                <div className="flex items-center gap-2 pr-3 border-r border-white/10">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-600'}`} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {isConnected ? 'Live' : 'Offline'}
                    </span>
                </div>

                <button
                    onClick={async () => {
                        try {
                            const { togglePause } = await import("@/lib/blockchain");
                            const aegisAddress = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;
                            if (!aegisAddress) return alert("Aegis Address missing");

                            const newPausedState = !isPaused;
                            setIsPaused(newPausedState);

                            const success = await togglePause(aegisAddress, newPausedState);
                            if (!success) {
                                setIsPaused(!newPausedState);
                                alert("Kill Switch Transaction Failed");
                            }
                        } catch (e) {
                            console.error(e);
                            setIsPaused(!isPaused);
                        }
                    }}
                    className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all active:scale-95 ${isPaused
                            ? "text-emerald-400 hover:bg-emerald-400/10"
                            : "text-red-400 hover:bg-red-400/10"
                        }`}
                >
                    {isPaused ? <Play className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {isPaused ? "Resume" : "Kill Switch"}
                    </span>
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Wallet className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{displayLabel}</p>
                        <h3 className="text-2xl font-bold text-white tabular-nums">${displayBalance}</h3>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={() => setViewMode(viewMode === "WALLET" ? "VAULT" : "WALLET")}
                        className="text-[9px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors"
                    >
                        Switch to {viewMode === "WALLET" ? "Vault" : "Wallet"}
                    </button>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Secure</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">ETH Balance</p>
                    <p className="text-sm font-bold text-white">{ethBalance} ETH</p>
                </div>
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
                    className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-30 active:scale-95"
                >
                    <Plus className="w-3 h-3" /> Add MNEE
                </button>
            </div>

            {/* Kill Switch */}
            {!isRealMode && isConnected && (
                <button
                    onClick={async () => {
                        try {
                            const { togglePause } = await import("@/lib/blockchain");
                            const aegisAddress = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;
                            if (!aegisAddress) return alert("Aegis Address missing");

                            const newPausedState = !isPaused;
                            setIsPaused(newPausedState);

                            const success = await togglePause(aegisAddress, newPausedState);
                            if (!success) {
                                setIsPaused(!newPausedState);
                                alert("Kill Switch Transaction Failed");
                            }
                        } catch (e) {
                            console.error(e);
                            setIsPaused(!isPaused);
                        }
                    }}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl border transition-all active:scale-95 ${isPaused
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                        }`}
                >
                    {isPaused ? (
                        <>
                            <Play className="w-4 h-4" /> Resume Operations
                        </>
                    ) : (
                        <>
                            <Power className="w-4 h-4" /> Emergency Kill Switch
                        </>
                    )}
                </button>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="text-[10px] font-mono text-slate-500">
                    {address.slice(0, 6)}...{address.slice(-4)}
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {isConnected ? 'Connected' : 'Offline'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
