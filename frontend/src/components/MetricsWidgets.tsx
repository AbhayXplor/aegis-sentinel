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
    const [authorizedOps, setAuthorizedOps] = useState<any[]>([]);

    const handleReject = async (address: string) => {
        if (!confirm(`Are you sure you want to BLOCK ${address}? This will create a new policy.`)) return;

        // Import dynamically to avoid SSR issues
        const { whitelistRecipient } = await import("@/lib/blockchain");
        const AEGIS_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;

        if (AEGIS_ADDRESS) {
            const success = await whitelistRecipient(AEGIS_ADDRESS, address, false);
            if (success) alert(`Blocked ${address}`);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            const { data } = await supabase
                .from('transactions')
                .select('*');

            if (data) {
                const blocked = data.filter(t => t.status !== 'SUCCESS').length;
                const success = data.filter(t => t.status === 'SUCCESS');
                setBlockedCount(blocked);
                setSuccessCount(success.length);

                // Process authorized ops for list
                import("@/lib/constants").then(({ KNOWN_ENTITIES }) => {
                    const ops = success.slice(0, 10).map(t => ({
                        entity: KNOWN_ENTITIES[t.recipient || t.target] || "Unknown Service",
                        value: t.value || "0",
                        address: t.recipient || t.target
                    }));
                    setAuthorizedOps(ops);
                });

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

            {/* Authorized Operations List */}
            <div className="col-span-2 p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between sticky top-0 bg-[#020617]/80 backdrop-blur-md pb-2 z-10 border-b border-white/5">
                    <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Authorized Operations</span>
                    </div>
                    <div className="text-xs font-bold text-white">{successCount}</div>
                </div>

                <div className="space-y-1.5">
                    {authorizedOps.length === 0 ? (
                        <div className="text-[9px] text-zinc-600 text-center py-4 italic">No authorized operations yet</div>
                    ) : (
                        authorizedOps.map((op, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-emerald-400">
                                            {op.entity}
                                        </span>
                                        <span className="text-[8px] text-zinc-500 font-mono">
                                            {op.value} MNEE
                                        </span>
                                    </div>
                                    <span className="text-[8px] text-zinc-600 truncate max-w-[120px]">
                                        {op.address}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleReject(op.address)}
                                    className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[8px] font-bold uppercase hover:bg-red-500/20 transition-all"
                                >
                                    Block
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
