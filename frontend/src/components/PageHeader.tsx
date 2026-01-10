"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/10">
            <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
            </div>
            {action && (
                <div className="flex-none">
                    {action}
                </div>
            )}
        </div>
    );
}
