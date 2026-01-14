import { useState, useEffect } from "react";
import { Activity, ShieldAlert, ShieldCheck, Clock } from "lucide-react";
import { TokenLogo } from "./TokenLogo";
import { supabase } from "@/lib/supabase";

interface MetricsWidgetsProps {
    balance: string;
    vaultBalance: string;
    demoPhase?: number;
    isRealMode?: boolean;
}

export function MetricsWidgets({ balance, vaultBalance, isRealMode }: MetricsWidgetsProps) {
    const [runway, setRunway] = useState<string>("...");
    const [monthlyBurn, setMonthlyBurn] = useState<number>(0);

    // Default to 0, real data should be fetched from DB/Chain
    const threatLevel = "LOW";
    const blockedCount = 0;
    const volume = 0;

    useEffect(() => {
        const calculateRunway = async () => {
            let totalAllowance = 0;

            if (isRealMode) {
                const { data, error } = await supabase
                    .from('entities')
                    .select('monthly_allowance');

                if (!error && data) {
                    totalAllowance = data.reduce((acc, curr) => acc + Number(curr.monthly_allowance), 0);
                }
            } else {
                // Mock monthly burn: 42,500 (Payroll) + 8,200 (Rent) + 12,450 (AWS) = 63,150
                totalAllowance = 63150;
            }

            setMonthlyBurn(totalAllowance);

            if (totalAllowance > 0) {
                const balanceNum = Number(balance.replace(/,/g, ''));
                const months = balanceNum / totalAllowance;
                setRunway(months > 12 ? "> 12" : months.toFixed(1));
            } else {
                setRunway("∞");
            }
        };

        calculateRunway();
    }, [balance, isRealMode]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1: Liquidity */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">Total Liquidity</span>
                    <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Wallet</span>
                        <div className="text-xl font-semibold text-white">${balance}</div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-[10px] text-blue-400 uppercase font-bold">Aegis Vault</span>
                        <div className="text-xl font-semibold text-blue-400">${vaultBalance}</div>
                    </div>
                </div>
                {!isRealMode && (
                    <div className="mt-4 pt-4 border-t border-white/5 text-xs text-emerald-500 font-medium">
                        +2.4% from last week
                    </div>
                )}
            </div>

            {/* Card 2: Volume */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">Volume (Tokens)</span>
                    <Activity className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex items-center gap-3">
                    <TokenLogo className="w-8 h-8" />
                    <div className="text-3xl font-semibold text-white">{volume}</div>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                    Last 24 hours
                </div>
            </div>

            {/* Card 3: Runway Forecaster */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">Runway (Months)</span>
                    <Clock className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-semibold text-emerald-500">{runway}</div>
                <div className="mt-2 text-xs text-slate-500">
                    Est. burn: ${monthlyBurn.toLocaleString()} / mo
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
