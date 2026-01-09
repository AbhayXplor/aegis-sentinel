"use client";

import { useState } from "react";
import { Play, SkipForward, AlertTriangle, CheckCircle, ShieldAlert, MessageSquare } from "lucide-react";

interface DemoControllerProps {
    onPhaseChange: (phase: number) => void;
    currentBalance: string;
    setSimulatedBalance: (balance: string) => void;
}

export function DemoController({ onPhaseChange, currentBalance, setSimulatedBalance }: DemoControllerProps) {
    const [phase, setPhase] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const phases = [
        {
            id: 0,
            title: "Phase 1: Setup",
            desc: "System Online. Define strict policy.",
            icon: <CheckCircle className="w-4 h-4 text-blue-400" />,
            action: "Initialize",
            handler: async () => { }
        },
        {
            id: 1,
            title: "Phase 2: Rogue Agent",
            desc: "Bob attempts unauthorized transfer.",
            icon: <ShieldAlert className="w-4 h-4 text-red-500" />,
            action: "Trigger Attack",
            handler: async () => {
                // Attack with 10% of balance
                const amount = Math.max(10, parseFloat(currentBalance) * 0.1).toFixed(2);
                await fetch('/api/rogue-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'ATTACK', customAmount: amount })
                });
            }
        },
        {
            id: 2,
            title: "Phase 3: The Pivot",
            desc: "Business needs change. Update policy.",
            icon: <MessageSquare className="w-4 h-4 text-yellow-400" />,
            action: "Update Rules",
            handler: async () => { }
        },
        {
            id: 3,
            title: "Phase 4: Good Employee",
            desc: "Bob executes allowed transaction.",
            icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
            action: "Execute Valid Tx",
            handler: async () => {
                // Valid tx with 5% of balance
                const amount = Math.max(5, parseFloat(currentBalance) * 0.05).toFixed(2);

                // 1. Trigger API (Simulated Success)
                await fetch('/api/rogue-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'VALID', customAmount: amount })
                });

                // 2. Visual Balance Update
                const newBalance = (parseFloat(currentBalance) - parseFloat(amount)).toFixed(2);
                setSimulatedBalance(newBalance);
            }
        }
    ];

    const nextPhase = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        const currentHandler = phases[(phase + 1) % phases.length].handler;
        if (currentHandler) await currentHandler();

        const next = (phase + 1) % phases.length;
        setPhase(next);
        onPhaseChange(next);
        setIsProcessing(false);
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-2xl p-2 shadow-2xl flex items-center gap-4 pr-6">

                {/* Current Phase Indicator */}
                <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-xl border border-white/5">
                    <div className="p-2 bg-white/5 rounded-lg">
                        {phases[phase].icon}
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Step</div>
                        <div className="text-sm font-bold text-white">{phases[phase].title}</div>
                        <div className="text-xs text-zinc-400">{phases[phase].desc}</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="h-8 w-[1px] bg-white/10" />

                <button
                    onClick={nextPhase}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                    <Play className="w-3 h-3 fill-current" />
                    {phases[(phase + 1) % phases.length].action}
                </button>

                <button
                    onClick={() => {
                        setPhase(0);
                        onPhaseChange(0);
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                    title="Reset Demo"
                >
                    <SkipForward className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
