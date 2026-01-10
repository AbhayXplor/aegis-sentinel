"use client";

import { Activity, ShieldAlert, ShieldCheck } from "lucide-react";
import { MneeLogo } from "./MneeLogo";

interface MetricsWidgetsProps {
    balance: string;
    demoPhase?: number;
}

export function MetricsWidgets({ balance }: MetricsWidgetsProps) {
    // Hardcoded for now, will connect to props later if needed
    const threatLevel = "LOW";
    const blockedCount = 12;
    const totalTx = 142;
    const volume = 34.13;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1: Liquidity */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">Total Liquidity</span>
                    <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-3xl font-semibold text-white">${balance}</div>
                </div>
                <div className="mt-2 text-xs text-emerald-500 font-medium">
                    +2.4% from last week
                </div>
            </div>

            {/* Card 2: Volume */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">Volume (MNEE)</span>
                    <Activity className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex items-center gap-3">
                    <MneeLogo className="w-8 h-8" />
                    <div className="text-3xl font-semibold text-white">{volume}</div>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                    Last 24 hours
                </div>
            </div>

            {/* Card 3: Threat Level */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">Threat Level</span>
                    <ShieldAlert className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-semibold text-emerald-500">{threatLevel}</div>
                <div className="mt-2 text-xs text-slate-500">
                    System nominal
                </div>
            </div>

            {/* Card 4: Blocked */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">Threats Blocked</span>
                    <ShieldCheck className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-3xl font-semibold text-white">{blockedCount}</div>
                <div className="mt-2 text-xs text-slate-500">
                    Last 24 hours
                </div>
            </div>
        </div>
    );
}
