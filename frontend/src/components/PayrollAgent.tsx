"use client";

import { useState, useEffect } from "react";
import { Bot, Sparkles, Bell, CheckCircle, ArrowRight, Loader2, Lock, Play, Pause, Settings, Plus, Trash2, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { agentWallet } from "@/lib/agentWallet";
import { checkAgentStatus, executeTransferWithAgent } from "@/lib/blockchain";
import { REAL_MNEE_ADDRESS } from "@/lib/constants";
import { AgentAuthorizationModal } from "./AgentAuthorizationModal";
import { AgentSettingsModal } from "./AgentSettingsModal";
import { ethers } from "ethers";
import { AddStreamModal } from "./AddStreamModal";

interface PaymentRule {
    id: string;
    name: string;
    amount: string;
    frequency: string;
    recipient: string;
    status: 'active' | 'paused';
    nextRun: string;
}

interface PayrollAgentProps {
    isRealMode?: boolean;
}

// ... (existing imports)

export function PayrollAgent({ isRealMode = false }: PayrollAgentProps) {
    const [rules, setRules] = useState<PaymentRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAgentAuthorized, setIsAgentAuthorized] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAddStreamModal, setShowAddStreamModal] = useState(false); // New State
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionStatus, setExecutionStatus] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [agentSettings, setAgentSettings] = useState({
        checkFrequency: 60,
        maxTransactionLimit: "10000",
        retryAttempts: 3,
        enabled: false
    });

    useEffect(() => {
        loadRules();
        verifyAgent();
    }, [isRealMode]);

    const loadRules = () => {
        setIsLoading(true);
        if (!isRealMode) {
            // Mock Rules for Demo Mode
            setRules([
                { id: '1', name: 'Daily API Costs', amount: '10.00', frequency: 'Daily', recipient: '0x71C...9A21', status: 'active', nextRun: 'Today, 11:00 PM' },
                { id: '2', name: 'Weekly Contractor Payout', amount: '100.00', frequency: 'Weekly', recipient: '0x3D2...1B4C', status: 'paused', nextRun: 'Mon, 9:00 AM' },
                { id: '3', name: 'Monthly Server Rent', amount: '450.00', frequency: 'Monthly', recipient: '0x8F4...2C9D', status: 'active', nextRun: 'Feb 1st' }
            ]);
        } else {
            // Real Mode: Fetch from Supabase or LocalStorage (Empty for now)
            setRules([]);
        }
        setIsLoading(false);
    };

    const verifyAgent = async () => {
        const address = agentWallet.getAddress();
        const AEGIS_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;
        if (address && AEGIS_ADDRESS) {
            const isAuth = await checkAgentStatus(AEGIS_ADDRESS, address, true);
            setIsAgentAuthorized(isAuth);
        }
    };

    const toggleRule = (id: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r));
    };

    const deleteRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const handleAddStream = (newRule: PaymentRule) => {
        setRules([...rules, newRule]);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden group">
            {/* ... (Header and Background Glow remain same) ... */}
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                Aegis Auto-Pilot
                                <span className={`px-2 py-0.5 rounded-full text-[9px] border flex items-center gap-1 ${isAgentAuthorized ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                                    {isAgentAuthorized ? <Sparkles className="w-2 h-2" /> : <Lock className="w-2 h-2" />}
                                    {isAgentAuthorized ? 'Active' : 'Auth Required'}
                                </span>
                            </h3>
                            <p className="text-[10px] text-blue-200 font-medium">Automated Payment Streams</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-white/10"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Rules List */}
                <div className="space-y-3 mb-6">
                    {rules.length > 0 ? (
                        rules.map((rule) => (
                            <div key={rule.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/10 hover:border-white/20 transition-all group/item">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${rule.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-white">{rule.name}</p>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">{rule.frequency}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500">
                                            Next: {rule.nextRun} • {rule.recipient}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">${rule.amount}</p>
                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">MNEE</p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => toggleRule(rule.id)}
                                            className={`p-1.5 rounded-lg transition-colors ${rule.status === 'active' ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-700'}`}
                                        >
                                            {rule.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                        </button>
                                        <button
                                            onClick={() => deleteRule(rule.id)}
                                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-white/10 rounded-xl">
                            No active payment streams found.
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setShowAddStreamModal(true)}
                    className="w-full py-3 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Stream</span>
                </button>
            </div>

            {showAuthModal && (
                <AgentAuthorizationModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={() => {
                        setShowAuthModal(false);
                        setIsAgentAuthorized(true);
                    }}
                    isRealMode={true}
                />
            )}

            <AddStreamModal
                isOpen={showAddStreamModal}
                onClose={() => setShowAddStreamModal(false)}
                onSave={handleAddStream}
            />

            <AgentSettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onSave={(newSettings) => {
                    setAgentSettings(newSettings);
                    setShowSettings(false);
                }}
                initialSettings={agentSettings}
            />
        </div>
    );
}
