"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { supabase } from "@/lib/supabase";
import { Activity, ShieldCheck, ShieldAlert, TrendingUp } from "lucide-react";
import { KNOWN_ENTITIES } from "@/lib/constants";

export function AnalyticsDashboard() {
    const [stats, setStats] = useState<{
        successCount: number;
        blockedCount: number;
        totalValue: number;
        targetData: { name: string; value: number }[];
        timeData: { time: string; value: number }[];
    }>({
        successCount: 0,
        blockedCount: 0,
        totalValue: 0,
        targetData: [],
        timeData: []
    });

    useEffect(() => {
        const fetchData = async () => {
            const { data: txs } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: true });

            if (!txs) return;

            const success = txs.filter(t => t.status === 'SUCCESS').length;
            const blocked = txs.filter(t => t.status !== 'SUCCESS').length;
            const totalVal = txs.reduce((acc, t) => acc + parseFloat(t.value || "0"), 0);

            // Target Distribution (using recipient if available, else target)
            const targets: Record<string, number> = {};
            txs.forEach(t => {
                const addr = t.recipient || t.target;
                const name = KNOWN_ENTITIES[addr] || "Unknown";
                targets[name] = (targets[name] || 0) + 1;
            });

            const targetData = Object.entries(targets).map(([name, value]) => ({ name, value }));

            // Time Series (Last 15 txs)
            const timeData = txs.slice(-15).map(t => ({
                time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                value: parseFloat(t.value || "0")
            }));

            setStats({
                successCount: success,
                blockedCount: blocked,
                totalValue: totalVal,
                targetData,
                timeData
            });
        };

        fetchData();
        const subscription = supabase
            .channel('analytics-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchData)
            .subscribe();

        return () => { supabase.removeChannel(subscription); };
    }, []);

    const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Summary Cards */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Total Tx</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.successCount + stats.blockedCount}</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Successful</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">{stats.successCount}</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Blocked</span>
                    </div>
                    <div className="text-2xl font-bold text-red-400">{stats.blockedCount}</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Volume (MNEE)</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-400">{stats.totalValue.toFixed(2)}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-xl h-[350px] flex flex-col">
                <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4">Success vs Blocked</h3>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                            { name: 'Success', value: stats.successCount, fill: '#10b981' },
                            { name: 'Blocked', value: stats.blockedCount, fill: '#ef4444' }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="name" stroke="#666" fontSize={10} />
                            <YAxis stroke="#666" fontSize={10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-xl h-[350px] flex flex-col">
                <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4">Target Distribution</h3>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.targetData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.targetData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '8px', paddingLeft: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-xl h-[350px] flex flex-col">
                <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4">Volume Trend</h3>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.timeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="time" stroke="#666" fontSize={10} />
                            <YAxis stroke="#666" fontSize={10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
