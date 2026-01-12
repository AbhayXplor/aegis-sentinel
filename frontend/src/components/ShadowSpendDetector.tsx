import { useState, useEffect } from "react";
import { AlertTriangle, Plus, Loader2, Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ShadowSpend {
    address: string;
    totalAmount: number;
    count: number;
    lastSeen: string;
}

export function ShadowSpendDetector({ isRealMode }: { isRealMode: boolean }) {
    const [shadowSpends, setShadowSpends] = useState<ShadowSpend[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        detectShadowSpend();
    }, [isRealMode]);

    const detectShadowSpend = async () => {
        setIsLoading(true);

        // 1. Get all known entity addresses
        const { data: entities } = await supabase.from('entities').select('wallet_address');
        const knownAddresses = new Set(entities?.map(e => e.wallet_address.toLowerCase()) || []);

        // 2. Get all successful transactions
        const { data: txs } = await supabase
            .from('transactions')
            .select('*')
            .eq('status', 'SUCCESS');

        if (txs && txs.length > 0) {
            const spendMap: Record<string, { total: number, count: number, last: string }> = {};

            txs.forEach(tx => {
                const addr = tx.target_address.toLowerCase();
                if (!knownAddresses.has(addr)) {
                    if (!spendMap[addr]) {
                        spendMap[addr] = { total: 0, count: 0, last: tx.created_at };
                    }
                    spendMap[addr].total += Number(tx.value);
                    spendMap[addr].count += 1;
                }
            });

            // Filter for "recurring" (count > 1)
            const detected = Object.entries(spendMap)
                .filter(([_, data]) => data.count > 1)
                .map(([addr, data]) => ({
                    address: addr,
                    totalAmount: data.total,
                    count: data.count,
                    lastSeen: new Date(data.last).toLocaleDateString()
                }));

            setShadowSpends(detected);
        } else if (!isRealMode) {
            // MOCK DATA FOR DEMO MODE
            setShadowSpends([
                { address: "0x71C...9A21", totalAmount: 4500, count: 5, lastSeen: "2 days ago" },
                { address: "0x3D2...1B4C", totalAmount: 1200, count: 3, lastSeen: "5 hours ago" }
            ]);
        } else {
            setShadowSpends([]);
        }

        setIsLoading(false);
    };

    if (shadowSpends.length === 0 && !isLoading) return null;

    return (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-500/10 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shadow Spend Detected</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Unlabelled recurring payments found in history</p>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                    </div>
                ) : (
                    shadowSpends.map((spend, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                    <Search className="w-3 h-3 text-rose-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-mono text-white">
                                        {spend.address.substring(0, 6)}...{spend.address.substring(spend.address.length - 4)}
                                    </p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                                        Seen {spend.count} times • Last: {spend.lastSeen}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <div>
                                    <p className="text-xs font-bold text-white">${spend.totalAmount.toLocaleString()}</p>
                                    <p className="text-[9px] text-rose-400 uppercase tracking-widest font-bold">Total Drain</p>
                                </div>
                                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                    <span className="text-rose-400 font-bold">AI Insight:</span> These addresses are receiving regular payments but are not in your Entity Directory. Add them to track as official vendors or block them if unauthorized.
                </p>
            </div>
        </div>
    );
}
