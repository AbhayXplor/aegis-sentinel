"use client";

import { MetricsWidgets } from "../MetricsWidgets";
import { AnalyticsDashboard } from "../AnalyticsDashboard";
import { AuthorizedOperations } from "../AuthorizedOperations";
import { PageHeader } from "../PageHeader";
import { WalletStatus } from "../WalletStatus";

interface DashboardViewProps {
    balance: string;
    ethBalance: string;
    vaultBalance: string;
    userAddress: string | null;
    isConnected: boolean;
    isRealMode: boolean;
    isPaused: boolean;
    setIsPaused: (paused: boolean) => void;
    demoPhase: number;
    connectWallet?: () => void;
}

export function DashboardView(props: DashboardViewProps) {
    return (
        <div>
            <PageHeader
                title="Overview"
                subtitle="Financial performance and security status."
                action={
                    <div className="flex items-center gap-3">
                        <WalletStatus
                            {...props}
                            address={props.userAddress || ""}
                            riskLevel="LOW"
                            compact={true}
                        />
                        <button
                            onClick={props.connectWallet}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-colors"
                        >
                            {props.isConnected ? "Connected" : "Connect Wallet"}
                        </button>
                    </div>
                }
            />

            <MetricsWidgets balance={props.balance} demoPhase={props.demoPhase} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Analytics Section - Takes 2 columns on large screens */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">Analytics</h3>
                    </div>
                    <AnalyticsDashboard />
                </div>

                {/* Operations Section - Takes 1 column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">Recent Operations</h3>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-0 overflow-hidden min-h-[600px]">
                        <AuthorizedOperations />
                    </div>
                </div>
            </div>
        </div>
    );
}
