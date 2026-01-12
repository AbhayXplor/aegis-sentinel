"use client";

import { ReactNode } from "react";

interface MetricCardProps {
    title: string;
    value: string;
    subValue?: string;
    icon?: ReactNode;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export function MetricCard({ title, value, subValue, icon, trend, trendUp, className = "" }: MetricCardProps) {
    return (
        <div className={`relative overflow-hidden rounded-2xl bg-[#0B1121] border border-white/5 p-6 group hover:border-blue-500/30 transition-all ${className}`}>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/10 transition-all"></div>

            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
                {icon && <div className="p-2 bg-white/5 rounded-lg text-blue-400">{icon}</div>}
            </div>

            <div className="space-y-1">
                <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
                {subValue && <div className="text-sm text-slate-500">{subValue}</div>}
            </div>

            {trend && (
                <div className={`mt-4 flex items-center text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trendUp ? '↑' : '↓'} {trend}
                    <span className="text-slate-500 ml-1">vs last month</span>
                </div>
            )}
        </div>
    );
}
