"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Activity, Zap, ShieldAlert, Terminal, Trash2, ShieldCheck } from "lucide-react";
import { supabase, clearTransactions } from "../lib/supabase";
import { KNOWN_ENTITIES } from "@/lib/constants";

export interface Transaction {
    id: string;
    tx_hash: string;
    target: string;
    recipient?: string;
    function_selector: string;
    status: "SUCCESS" | "BLOCKED" | "WARNING" | "ERROR";
    ai_analysis: string;
    value: string;
    created_at: string;
    is_simulated: boolean;
}

export function ActivityFeed() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const handleClearLogs = async () => {
        const success = await clearTransactions();
        if (success) setTransactions([]);
    };

    useEffect(() => {
        // 1. Fetch Initial Data
        const fetchInitial = async () => {
            const { data } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            if (data) setTransactions(data);
        };
        fetchInitial();

        // 2. Subscribe to Realtime
        const channel = supabase
            .channel('realtime-transactions')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
                const newTx = payload.new as Transaction;
                setTransactions((prev) => [newTx, ...prev].slice(0, 50));
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'transactions' }, () => {
                fetchInitial();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="glass-panel p-6 rounded-xl h-full flex flex-col relative overflow-hidden">
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none animate-scan z-0" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center">
                    <Terminal className="w-4 h-4 mr-2 text-cyber-cyan" /> Live Audit Log
                </h2>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleClearLogs}
                        className="text-[10px] text-gray-500 hover:text-cyber-red transition-colors flex items-center gap-1 uppercase tracking-widest font-bold"
                    >
                        <Trash2 className="w-3 h-3" /> Clear
                    </button>
                    <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-cyber-green font-bold animate-pulse">SYSTEM ACTIVE</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse shadow-[0_0_10px_var(--cyber-green)]" />
                    </div>
                </div>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-white/10 relative z-10">
                <AnimatePresence initial={false}>
                    {transactions.map((tx) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-2.5 rounded border-l-2 transition-all duration-300 font-mono text-[10px] ${tx.status === "SUCCESS"
                                ? "bg-emerald-900/10 border-l-emerald-500 border-y border-r border-white/5 hover:bg-emerald-900/20"
                                : "bg-red-900/10 border-l-red-500 border-y border-r border-white/5 hover:bg-red-900/20"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-1.5">
                                    {tx.status === "SUCCESS" ? (
                                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                        <ShieldAlert className="w-3 h-3 text-red-500" />
                                    )}
                                    <span className={`font-bold ${tx.status === "SUCCESS" ? "text-emerald-500" : "text-red-500"}`}>
                                        {tx.status === "SUCCESS" ? "AUTHORIZED" : "BLOCKED"}
                                    </span>
                                    <span className="text-gray-500 opacity-30">|</span>
                                    <span className="text-gray-400 opacity-50 text-[9px]">{tx.function_selector}</span>
                                </div>
                                <span className="text-gray-600 text-[9px]">
                                    {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="pl-4.5 text-gray-400 truncate flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-zinc-500 text-[9px]">Entity:</span>
                                    <span className="text-gray-200 font-bold">
                                        {(() => {
                                            const displayAddr = tx.recipient || tx.target;
                                            return KNOWN_ENTITIES[displayAddr] || "Unknown Entity";
                                        })()}
                                    </span>
                                    <span className="text-[8px] text-zinc-600 truncate max-w-[100px] opacity-50">
                                        ({(tx.recipient || tx.target).slice(0, 6)}...{(tx.recipient || tx.target).slice(-4)})
                                    </span>
                                </div>
                                {tx.value && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-zinc-500 text-[9px]">Amount:</span> <span className="text-white font-bold">{tx.value} MNEE</span>
                                    </div>
                                )}
                            </div>

                            {tx.ai_analysis && (
                                <div className="mt-1.5 pl-4.5 text-[9px] text-gray-500 border-l border-white/10 pl-2 leading-tight">
                                    <span className="text-cyber-cyan opacity-60 font-bold">AI_AUDIT:</span> {tx.ai_analysis}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {transactions.length === 0 && (
                    <div className="text-center text-gray-600 text-xs py-20 font-bold uppercase tracking-widest opacity-50">
                        // Awaiting Network Traffic...
                    </div>
                )}
            </div>
        </div>
    );
}
