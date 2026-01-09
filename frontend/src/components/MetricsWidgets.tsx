"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Zap, Activity, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MetricsWidgetsProps {
    balance: string;
    demoPhase: number;
}

export function MetricsWidgets({ balance, demoPhase }: MetricsWidgetsProps) {
    const [threatLevel, setThreatLevel] = useState("LOW");
    const [blockedCount, setBlockedCount] = useState(0);
    const [successCount, setSuccessCount] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            const { data } = await supabase
                .from('transactions')
                .select('status');

            if (data) {
                const blocked = data.filter(t => t.status !== 'SUCCESS').length;
                const success = data.filter(t => t.status === 'SUCCESS').length;
                setBlockedCount(blocked);
                setSuccessCount(success);

                // Threat level based on recent activity
                const recent = data.slice(-5);
                const recentBlocked = recent.filter(t => t.status === 'BLOCKED').length;
                if (recentBlocked >= 2) setThreatLevel("CRITICAL");
                else if (recentBlocked >= 1) setThreatLevel("HIGH");
                else setThreatLevel("LOW");
            }
        };

        fetchStats();
        const sub = supabase.channel('metrics-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchStats)
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, []);

    // 1. Calculate Total Value Secured (1 MNEE = $1)
    const totalValue = parseFloat(balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="grid grid-cols-2 gap-3">
            {/* Total Value Secured */}
            <div className="col-span-2 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-1">Total Value Secured</div>
                <div className="text-2xl font-bold text-white tracking-tight">${totalValue}</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-emerald-500 font-bold uppercase">Live Balance Monitoring</span>
                </div>
            </div>

            {/* Threat Level */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-1.5 mb-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Threat Level</span>
                </div>
                <div className={`text-xl font-bold ${threatLevel === "CRITICAL" ? "text-red-500 animate-pulse" : threatLevel === "HIGH" ? "text-orange-500" : "text-emerald-500"}`}>
                    {threatLevel}
                </div>
            </div>

            {/* Intercepted Threats */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-1.5 mb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Blocked</span>
                </div>
                <div className="text-xl font-bold text-white">{blockedCount}</div>
            </div>

            {/* Successful Ops */}
            <div className="col-span-2 p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Authorized Operations</span>
                    </div>
                    <div className="text-lg font-bold text-white">{successCount}</div>
                </div>
            </div>
        </div>
    );
}
