"use client";

import { useState } from "react";
import { Play, SkipForward, AlertTriangle, CheckCircle, ShieldAlert, MessageSquare } from "lucide-react";

interface DemoControllerProps {
    onPhaseChange: (phase: number) => void;
    currentBalance: string;
    setSimulatedBalance: (balance: string) => void;
    isPaused?: boolean;
    className?: string;
}

export function DemoController({ onPhaseChange, currentBalance, setSimulatedBalance, isPaused = false, className = "" }: DemoControllerProps) {
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
        if (isProcessing || isPaused) return;
        setIsProcessing(true);

        const currentHandler = phases[(phase + 1) % phases.length].handler;
        if (currentHandler) await currentHandler();

        const next = (phase + 1) % phases.length;
        setPhase(next);
        onPhaseChange(next);
        setIsProcessing(false);
    };

    return (
        <div className={`bg-slate-900 border border-slate-800 rounded-lg p-4 ${className}`}>
            {/* Current Phase Indicator */}
            <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-slate-800 rounded-lg shrink-0">
                    {phases[phase].icon}
                </div>
                <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Current Step</div>
                    <div className="text-sm font-semibold text-white truncate">{phases[phase].title}</div>
                    <div className="text-xs text-slate-400 line-clamp-2">{phases[phase].desc}</div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
                <button
                    onClick={nextPhase}
                    disabled={isPaused}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${isPaused
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                >
                    {isPaused ? (
                        <>
                            <AlertTriangle className="w-3 h-3 text-yellow-500" />
                            PAUSED
                        </>
                    ) : (
                        <>
                            <Play className="w-3 h-3 fill-current" />
                            {phases[(phase + 1) % phases.length].action}
                        </>
                    )}
                </button>

                <button
                    onClick={() => {
                        setPhase(0);
                        onPhaseChange(0);
                    }}
                    className="p-2 hover:bg-slate-800 rounded-md text-slate-500 hover:text-white transition-colors"
                    title="Reset Demo"
                >
                    <SkipForward className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
