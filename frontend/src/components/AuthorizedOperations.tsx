"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MneeLogo } from "./MneeLogo";

export function AuthorizedOperations() {
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
        const fetchOps = async () => {
            const { data } = await supabase
                .from('transactions')
                .select('*')
                .eq('status', 'SUCCESS')
                .order('created_at', { ascending: false })
                .limit(10);

            if (data) {
                import("@/lib/constants").then(({ KNOWN_ENTITIES }) => {
                    const ops = data.map(t => ({
                        entity: KNOWN_ENTITIES[t.recipient || t.target] || "Unknown Service",
                        value: t.value || "0",
                        address: t.recipient || t.target,
                        timestamp: new Date(t.created_at).toLocaleTimeString()
                    }));
                    setAuthorizedOps(ops);
                });
            }
        };

        fetchOps();
        const sub = supabase.channel('auth-ops-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchOps)
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, []);

    return (
        <div className="p-4 bg-slate-900/50 border border-white/5 rounded-xl backdrop-blur-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Authorized Operations</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    Live Feed
                </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {authorizedOps.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-8 italic">No authorized operations yet</div>
                ) : (
                    authorizedOps.map((op, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <span className="text-xs">✅</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white">{op.entity}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">{op.address}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <span className="text-xs font-bold text-emerald-400">{op.value}</span>
                                        <MneeLogo className="w-3 h-3" />
                                    </div>
                                    <div className="text-[10px] text-slate-600">{op.timestamp}</div>
                                </div>
                                <button
                                    onClick={() => handleReject(op.address)}
                                    className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-[10px] font-bold uppercase hover:bg-red-500/20 transition-all"
                                >
                                    Block
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
