"use client";

import { useState, useEffect } from "react";
import { Send, Shield, CheckCircle, AlertTriangle, Loader2, Mic, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { parsePolicyIntent, PolicyIntent } from "@/lib/policyParser";
import { supabase } from "@/lib/supabase";
import { setPolicy, setSpendingLimit, whitelistRecipient } from "@/lib/blockchain";

interface StoredPolicy extends PolicyIntent {
    id: number;
}

export function PolicyChat() {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [proposedPolicy, setProposedPolicy] = useState<PolicyIntent | null>(null);
    const [activePolicies, setActivePolicies] = useState<StoredPolicy[]>([]);

    // Fetch policies on mount
    useEffect(() => {
        const fetchPolicies = async () => {
            const { data, error } = await supabase
                .from('policies')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (data && !error) {
                // Map Supabase data back to PolicyIntent structure
                const mappedPolicies: StoredPolicy[] = data.map(p => ({
                    id: p.id,
                    description: p.intent,
                    type: p.type as any || "RECIPIENT",
                    target: p.target || "0x...",
                    selector: p.selector,
                    amount: p.amount,
                    period: p.period,
                    riskScore: 0
                }));
                setActivePolicies(mappedPolicies);
            }
        };
        fetchPolicies();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        setProposedPolicy(null);

        const result = await parsePolicyIntent(input);
        setProposedPolicy(result);
        setIsLoading(false);
    };

    const deletePolicy = async (id: number) => {
        // Optimistic UI update
        setActivePolicies(prev => prev.filter(p => p.id !== id));

        const { error } = await supabase
            .from('policies')
            .update({ is_active: false })
            .eq('id', id);

        if (error) {
            console.error("Failed to delete policy:", error);
            // Revert if failed
            alert("Failed to delete policy. Please try again.");
            // Refresh list
            const { data } = await supabase
                .from('policies')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            if (data) {
                setActivePolicies(data.map(p => ({
                    id: p.id,
                    description: p.intent,
                    type: p.type as any || "RECIPIENT",
                    target: p.target || "0x...",
                    selector: p.selector,
                    amount: p.amount,
                    period: p.period,
                    riskScore: 0
                })));
            }
        }
    };

    const confirmPolicy = async () => {
        if (proposedPolicy) {
            const aegisAddress = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS || "";
            let success = false;

            if (proposedPolicy.type === "RECIPIENT") {
                success = await whitelistRecipient(aegisAddress, proposedPolicy.target, true);
            } else if (proposedPolicy.type === "SPENDING_LIMIT") {
                const tokenAddress = proposedPolicy.target || process.env.NEXT_PUBLIC_REAL_TOKEN_ADDRESS || "";
                const amount = proposedPolicy.amount || "0";
                const period = proposedPolicy.period || 86400;
                success = await setSpendingLimit(aegisAddress, tokenAddress, amount, period);
            } else {
                success = await setPolicy(aegisAddress, proposedPolicy.target, proposedPolicy.selector || "0x00000000", true);
            }

            if (success) {
                // Persist to Supabase for simulation and tab-switching
                const { data, error } = await supabase.from('policies').insert({
                    intent: proposedPolicy.description,
                    target: proposedPolicy.target,
                    selector: proposedPolicy.selector,
                    type: proposedPolicy.type,
                    amount: proposedPolicy.amount,
                    period: proposedPolicy.period,
                    is_active: true
                }).select();

                if (data && data[0]) {
                    setActivePolicies(prev => [{ ...proposedPolicy, id: data[0].id }, ...prev]);
                }

                setProposedPolicy(null);
                setInput("");
            } else {
                alert("Failed to set policy on-chain. Check console.");
            }
        }
    };

    return (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.2em]">Treasury Policy Engine</h2>
                <div className="flex items-center text-accent-blue text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent-blue/5 border border-accent-blue/20">
                    <Shield className="w-2.5 h-2.5 mr-1" /> ACTIVE
                </div>
            </div>

            {/* Active Policies List */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-[120px] pr-2 custom-scrollbar">
                {activePolicies.length === 0 && !proposedPolicy && (
                    <div className="text-center text-gray-600 text-[10px] mt-8">
                        No active mandates. <br /> Speak a rule to start. <br />
                        <span className="italic opacity-50">"Set spending limit to 5k tokens"</span>
                    </div>
                )}

                <AnimatePresence>
                    {activePolicies.map((policy) => (
                        <motion.div
                            key={policy.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="p-2 rounded bg-green-500/5 border border-green-500/20 text-[10px] group relative"
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-gray-300 font-mono pr-6">{policy.description}</span>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => deletePolicy(policy.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                                    >
                                        <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                    <CheckCircle className="w-2.5 h-2.5 text-green-400 mt-0.5" />
                                </div>
                            </div>
                            <div className="mt-0.5 text-[8px] text-gray-500 font-mono">
                                {policy.target && policy.target !== "0x..." ? (
                                    `${policy.target.slice(0, 6)}...${policy.target.slice(-4)}`
                                ) : "Global Policy"}
                                {policy.selector ? ` :: ${policy.selector}` : ""}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Proposed Policy Card */}
            <AnimatePresence>
                {proposedPolicy && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mb-3 p-3 rounded bg-blue-600/10 border border-blue-500/30"
                    >
                        <div className="flex justify-between items-start mb-1.5">
                            <h3 className="text-blue-400 text-[10px] font-bold uppercase">Proposed Policy</h3>
                            <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${proposedPolicy.riskScore > 50 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                RISK: {proposedPolicy.riskScore}
                            </span>
                        </div>
                        <p className="text-white text-xs mb-2">{proposedPolicy.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-gray-400 mb-3">
                            <div>
                                <span className="block text-gray-600 text-[8px]">TARGET</span>
                                {proposedPolicy.target.slice(0, 8)}...
                            </div>
                            {proposedPolicy.type === "FUNCTION" && (
                                <div>
                                    <span className="block text-gray-600 text-[8px]">SELECTOR</span>
                                    {proposedPolicy.selector}
                                </div>
                            )}
                            {proposedPolicy.type === "SPENDING_LIMIT" && (
                                <>
                                    <div>
                                        <span className="block text-gray-600 text-[8px]">AMOUNT</span>
                                        {proposedPolicy.amount} Tokens
                                    </div>
                                    <div>
                                        <span className="block text-gray-600 text-[8px]">PERIOD</span>
                                        {proposedPolicy.period === 604800 ? "Weekly" : proposedPolicy.period === 2592000 ? "Monthly" : `${proposedPolicy.period}s`}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setProposedPolicy(null)}
                                className="flex-1 py-1 text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 rounded transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPolicy}
                                className="flex-1 py-1 text-[10px] bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='e.g., "Allow Payroll to send 5000 tokens"'
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-3 pr-16 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    disabled={isLoading}
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <button
                        type="button"
                        onClick={() => {
                            if (!('webkitSpeechRecognition' in window)) {
                                alert("Voice input not supported in this browser.");
                                return;
                            }
                            const recognition = new (window as any).webkitSpeechRecognition();
                            recognition.lang = 'en-US';
                            recognition.start();
                            setInput("Listening...");
                            recognition.onresult = (event: any) => {
                                const transcript = event.results[0][0].transcript;
                                setInput(transcript);
                            };
                            recognition.onerror = () => setInput("");
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                        title="Speak Policy"
                    >
                        <Mic className="w-3 h-3" />
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    </button>
                </div>
            </form>
        </div>
    );
}
