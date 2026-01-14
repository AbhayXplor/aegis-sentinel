"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TokenLogo } from "./TokenLogo";
import { History } from "lucide-react";
import { KNOWN_ENTITIES } from "@/lib/constants";

export function RealPayrollActivity() {
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        const fetchActivity = async () => {
            const { data } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) {
                const formatted = data.map(t => ({
                    label: KNOWN_ENTITIES[t.recipient || t.target] || "Unknown Recipient",
                    amount: t.value || "0.00",
                    status: t.status === 'SUCCESS' ? 'Completed' : 'Failed',
                    hash: t.transaction_hash
                }));
                setActivities(formatted);
            }
        };

        fetchActivity();
        const sub = supabase.channel('payroll-activity')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchActivity)
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, []);

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <History className="w-3 h-3 text-slate-400" /> Recent Activity
            </h3>
            <div className="space-y-4">
                {activities.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-4 italic">No recent payments</div>
                ) : (
                    activities.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                            <div>
                                <p className="text-[11px] font-bold text-white truncate max-w-[120px]">{item.label}</p>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest">{item.status}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold text-white">${item.amount}</p>
                                <div className="flex items-center justify-end gap-1">
                                    <span className="text-[9px] text-blue-400 uppercase tracking-widest">Tokens</span>
                                    <TokenLogo className="w-2 h-2" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
