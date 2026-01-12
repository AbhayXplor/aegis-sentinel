"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { supabase } from "@/lib/supabase";
import { Activity, ShieldCheck, ShieldAlert, TrendingUp } from "lucide-react";
import { KNOWN_ENTITIES } from "@/lib/constants";

export function AnalyticsDashboard({ isRealMode }: { isRealMode?: boolean }) {
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
            // In Real Mode, we only want real data. If no real data, show empty state.
            // In Demo Mode, we can show mock data if real data is empty.

            const { data: txs } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: true });

            if (!txs || txs.length === 0) {
                setStats({
                    successCount: 0,
                    blockedCount: 0,
                    totalValue: 0,
                    targetData: [],
                    timeData: []
                });
                return;
            }

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
    }, [isRealMode]);

    const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    return (
        <div className="space-y-6">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Volume Trend - Full Width on Mobile, Half on Desktop */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl h-[350px] flex flex-col lg:col-span-2">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4">Volume Trend</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.timeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="time" stroke="#666" fontSize={10} tickLine={false} axisLine={false} minTickGap={20} />
                                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Success vs Blocked */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl h-[300px] flex flex-col">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4">Success vs Blocked</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Success', value: stats.successCount, fill: '#10b981' },
                                { name: 'Blocked', value: stats.blockedCount, fill: '#ef4444' }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Target Distribution */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl h-[300px] flex flex-col">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4">Target Distribution</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.targetData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.targetData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '10px', color: '#94a3b8', paddingTop: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
