"use client";

import { Wallet } from "lucide-react";

interface ConnectWalletStateProps {
    onConnect: () => void;
}

export function ConnectWalletState({ onConnect }: ConnectWalletStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 bg-white/5 border border-white/10 rounded-2xl border-dashed m-6">
            <div className="p-4 bg-slate-800 rounded-full shadow-xl shadow-blue-900/20">
                <Wallet className="w-8 h-8 text-blue-400" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-2">Wallet Connection Required</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                    Connect your wallet to access the Aegis Financial Operating System.
                </p>
            </div>
            <button
                onClick={onConnect}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
                <span>Connect Wallet</span>
            </button>
        </div>
    );
}
