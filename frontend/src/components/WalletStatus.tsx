"use client";

import { useState } from "react";
import {
    Wallet,
    ShieldCheck,
    ShieldAlert,
    ExternalLink,
    Plus,
    ChevronDown,
    Copy,
    Check
} from "lucide-react";
import { TokenLogo } from "./TokenLogo";

interface WalletStatusProps {
    address: string | null;
    balance?: string;
    riskLevel?: "LOW" | "MEDIUM" | "HIGH";
    compact?: boolean;
    isRealMode?: boolean;
}

export function WalletStatus({
    address,
    balance = "0.00",
    riskLevel = "LOW",
    compact = false,
    isRealMode = false
}: WalletStatusProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!address) {
        return (
            <div className="flex items-center gap-3 p-2 bg-slate-900/50 border border-white/10 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-white/5">
                    <Wallet className="w-5 h-5 text-slate-500" />
                </div>
                <div className="text-left hidden sm:block">
                    <div className="text-sm font-bold text-slate-500">Not Connected</div>
                    <div className="text-[10px] text-slate-600">Connect wallet to start</div>
                </div>
            </div>
        );
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAddToken = async () => {
        const { addTokenToWallet } = await import("@/lib/blockchain");
        const { REAL_TOKEN_ADDRESS } = await import("@/lib/constants");

        if (REAL_TOKEN_ADDRESS) {
            await addTokenToWallet(REAL_TOKEN_ADDRESS, "USDC", 18);
        }
    };

    const riskColors = {
        LOW: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
        MEDIUM: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        HIGH: "text-rose-400 bg-rose-400/10 border-rose-400/20"
    };

    const riskIcons = {
        LOW: <ShieldCheck className="w-3 h-3" />,
        MEDIUM: <ShieldAlert className="w-3 h-3" />,
        HIGH: <ShieldAlert className="w-3 h-3" />
    };

    if (compact) {
        return (
            <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-900/50 border border-white/10 rounded-lg">
                <div className="flex items-center gap-2">
                    <TokenLogo className="w-4 h-4" />
                    <span className="text-xs font-bold text-white">{balance}</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-400">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 bg-slate-900/50 border border-white/10 rounded-xl hover:bg-slate-800 transition-all group"
            >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Wallet className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left hidden sm:block">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </span>
                        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${riskColors[riskLevel]}`}>
                            {riskIcons[riskLevel]}
                            {riskLevel} RISK
                        </span>
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Wallet</span>
                            <button
                                onClick={handleCopy}
                                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white font-mono">{address.slice(0, 12)}...{address.slice(-8)}</div>
                                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    CONNECTED (SEPOLIA)
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Balance</div>
                                <div className="flex items-center gap-1.5">
                                    <TokenLogo className="w-3 h-3" />
                                    <span className="text-sm font-bold text-white">{balance}</span>
                                </div>
                            </div>
                            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Risk Score</div>
                                <div className="text-sm font-bold text-emerald-400">0.02</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-2">
                        <button
                            onClick={handleAddToken}
                            className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                    <Plus className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span className="text-xs font-bold text-slate-300">Add Tokens</span>
                            </div>
                            <TokenLogo className="w-4 h-4" />
                        </button>

                        <a
                            href={`https://sepolia.etherscan.io/address/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                                    <ExternalLink className="w-4 h-4 text-slate-400" />
                                </div>
                                <span className="text-xs font-bold text-slate-300">View on Explorer</span>
                            </div>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
