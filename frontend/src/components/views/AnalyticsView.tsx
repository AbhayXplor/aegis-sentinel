"use client";

import { PageHeader } from "../PageHeader";
import { AnalyticsDashboard } from "../AnalyticsDashboard";
import { ShadowSpendDetector } from "../ShadowSpendDetector";
import { Activity } from "lucide-react";

interface AnalyticsViewProps {
    isRealMode: boolean;
}

export function AnalyticsView({ isRealMode }: AnalyticsViewProps) {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Analytics"
                subtitle="Deep dive into transaction history and anomaly detection."
                action={
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400">Live Monitoring</span>
                    </div>
                }
            />

            <div className="space-y-8">
                {/* Shadow Spend Detector (Top Priority) */}
                <ShadowSpendDetector isRealMode={isRealMode} />

                {/* Main Analytics Dashboard */}
                <AnalyticsDashboard isRealMode={isRealMode} />
            </div>
        </div>
    );
}
