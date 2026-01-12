"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "../PageHeader";
import { WalletStatus } from "../WalletStatus";
import { TreasuryChart } from "../dashboard/TreasuryChart";
import { AllocationChart } from "../dashboard/AllocationChart";
import { MetricCard } from "../dashboard/MetricCard";
import { Wallet, ArrowUpRight, ArrowDownRight, Activity, ShieldCheck, CreditCard, Lock } from "lucide-react";
import { getEthPrice } from "@/lib/price";

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
    disconnectWallet?: () => void;
}

export function DashboardView(props: DashboardViewProps) {
    const showRealData = props.isConnected;
    const [ethPrice, setEthPrice] = useState<number>(2500); // Default fallback

    useEffect(() => {
        getEthPrice().then(price => {
            if (price > 0) setEthPrice(price);
        });
    }, []);

    // Calculate Totals
    const mneeVal = parseFloat(props.balance);
    const ethVal = parseFloat(props.ethBalance);
    const totalAssets = ((ethVal * ethPrice) + (mneeVal * 1)).toFixed(2);

    // Chart Data Logic
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });

    // Generate dynamic mock history ending in current month
    const generateMockHistory = (finalValue: number) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIndex = new Date().getMonth();
        const history = [];

        // Generate last 10 months
        for (let i = 9; i >= 0; i--) {
            const dateIndex = (currentMonthIndex - i + 12) % 12;
            const dateName = months[dateIndex];

            // Create a realistic looking curve ending at finalValue
            // Random variance between -10% and +10% of the trend line
            const trendFactor = 1 - (i * 0.05); // Linear growth trend
            const variance = 0.9 + Math.random() * 0.2; // 0.9 to 1.1

            let value = finalValue * trendFactor * variance;

            // Ensure the last point matches exactly (or very close) to current total
            if (i === 0) value = finalValue;

            history.push({ date: dateName, value: Math.round(value) });
        }
        return history;
    };

    const mockHistory = generateMockHistory(parseFloat(totalAssets));

    // Real Mode: If we don't have history, show just the current point or empty
    const realHistory = [
        { date: currentMonth, value: parseFloat(totalAssets) }
    ];

    const chartData = props.isRealMode ? realHistory : mockHistory;

    const allocationData = [
        { name: 'MNEE', value: mneeVal },
        { name: 'ETH', value: ethVal * ethPrice }, // Value in USD
    ];

    // Fallback for empty wallet
    const displayAllocation = allocationData[0].value === 0 && allocationData[1].value === 0
        ? [{ name: 'Empty', value: 1 }]
        : allocationData;

    return (
        <div className="space-y-8">
            <PageHeader
                title="Dashboard"
                subtitle="Financial performance and security status."
                action={
                    <div className="flex items-center gap-3">
                        <WalletStatus
                            {...props}
                            address={props.userAddress || ""}
                            riskLevel="LOW"
                            compact={true}
                        />
                        {props.isConnected ? (
                            <button
                                onClick={props.disconnectWallet}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-md transition-colors border border-white/10"
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                onClick={props.connectWallet}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-colors"
                            >
                                Connect Wallet
                            </button>
                        )}
                    </div>
                }
            />

            {showRealData ? (
                <div className="grid grid-cols-12 gap-6">
                    {/* Row 1: Hero Chart (Full Width) */}
                    <div className="col-span-12 bg-[#0B1121] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-slate-400 text-sm font-medium mb-1">Total Treasury Value</h3>
                                <div className="text-3xl font-bold text-white flex items-center gap-3">
                                    ${parseFloat(totalAssets).toLocaleString()}
                                    {!props.isRealMode && (
                                        <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full flex items-center">
                                            <ArrowUpRight className="w-3 h-3 mr-1" /> 2.87%
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select className="bg-white/5 border border-white/10 text-slate-400 text-xs rounded-lg px-3 py-1.5 outline-none">
                                    <option>All Sectors</option>
                                </select>
                                <select className="bg-white/5 border border-white/10 text-slate-400 text-xs rounded-lg px-3 py-1.5 outline-none">
                                    <option>This Month</option>
                                </select>
                            </div>
                        </div>
                        <TreasuryChart data={chartData} isRealMode={props.isRealMode} />
                    </div>

                    {/* Row 2: Metrics */}
                    <div className="col-span-12 md:col-span-4">
                        <MetricCard
                            title="Total Assets"
                            value={`$${parseFloat(totalAssets) >= 1000000
                                ? (parseFloat(totalAssets) / 1000000).toFixed(2) + 'M'
                                : (parseFloat(totalAssets) / 1000).toFixed(1) + 'K'}`}
                            subValue="Across all networks"
                            icon={<CreditCard className="w-5 h-5" />}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                        <MetricCard
                            title="Active Wallets"
                            value="1"
                            subValue="Connected via MetaMask"
                            icon={<Wallet className="w-5 h-5" />}
                        />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                        <div className="h-full bg-[#0B1121] border border-white/5 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-slate-400 text-sm font-medium">Recent Activity</h3>
                                <button className="text-blue-400 text-xs hover:text-blue-300">View All</button>
                            </div>
                            <div className="space-y-4">
                                {props.isRealMode ? (
                                    <div className="text-center py-8 text-slate-500 text-xs">
                                        No recent activity found on-chain.
                                    </div>
                                ) : (
                                    [
                                        { name: 'Monthly Salaries', time: '23 mins ago', status: 'success' },
                                        { name: 'Office Rent', time: '48 mins ago', status: 'pending' },
                                        { name: 'AWS Infrastructure', time: '1 day ago', status: 'failed' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-emerald-500' :
                                                    item.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`} />
                                                <div>
                                                    <div className="text-sm text-white font-medium">{item.name}</div>
                                                    <div className="text-xs text-slate-500">{item.time}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {item.status === 'success' ? '+15 days' : item.status === 'pending' ? '-3 days' : '1 days'}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Bottom Details */}
                    <div className="col-span-12 md:col-span-8 bg-[#0B1121] border border-white/5 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold">Asset Breakdown</h3>
                            {!props.isRealMode && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                                        Demo Mode: Sepolia
                                    </span>
                                </div>
                            )}
                        </div>

                        {!props.isRealMode && (
                            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Activity className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-1">How to Test Demo Mode</h4>
                                    <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
                                        <li>Switch your wallet to <strong>Sepolia Testnet</strong>.</li>
                                        <li>Click <strong>Mint Demo MNEE</strong> below to get test tokens.</li>
                                        <li>Go to <strong>Settings</strong> to deposit MNEE into the Vault.</li>
                                        <li>Run the <strong>Payroll Agent</strong> to see automated payments.</li>
                                    </ol>
                                    <button
                                        onClick={async () => {
                                            const { mintMNEE } = await import("@/lib/blockchain");
                                            const { MOCK_MNEE_ADDRESS } = await import("@/lib/constants");
                                            if (MOCK_MNEE_ADDRESS) {
                                                await mintMNEE(MOCK_MNEE_ADDRESS, "10000");
                                                window.location.reload(); // Refresh to see balance
                                            }
                                        }}
                                        className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                        Mint 10,000 Demo MNEE
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs text-slate-500 border-b border-white/5">
                                        <th className="pb-3 font-medium">Asset</th>
                                        <th className="pb-3 font-medium">Balance</th>
                                        <th className="pb-3 font-medium text-right">% Portfolio</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    <tr className="border-b border-white/5 group hover:bg-white/[0.02]">
                                        <td className="py-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <Activity className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">Ethereum (Wallet)</div>
                                                <div className="text-xs text-slate-500">{props.ethBalance} ETH</div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-white font-medium">${(parseFloat(props.ethBalance) * ethPrice).toFixed(2)}</td>
                                        <td className="py-4 text-right text-emerald-400 font-medium">
                                            {parseFloat(totalAssets) > 0
                                                ? `${((parseFloat(props.ethBalance) * ethPrice / parseFloat(totalAssets)) * 100).toFixed(2)}%`
                                                : "0.00%"}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-white/5 group hover:bg-white/[0.02]">
                                        <td className="py-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">MNEE (Wallet)</div>
                                                <div className="text-xs text-slate-500">{props.balance} MNEE</div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-white font-medium">${props.balance}</td>
                                        <td className="py-4 text-right text-emerald-400 font-medium">
                                            {parseFloat(totalAssets) > 0
                                                ? `${((parseFloat(props.balance) * 1 / parseFloat(totalAssets)) * 100).toFixed(2)}%`
                                                : "0.00%"}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-white/5 group hover:bg-white/[0.02]">
                                        <td className="py-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">MNEE (Vault)</div>
                                                <div className="text-xs text-slate-500">{props.vaultBalance} MNEE</div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-white font-medium">${props.vaultBalance}</td>
                                        <td className="py-4 text-right text-emerald-400 font-medium">
                                            -
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-4 bg-[#0B1121] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-6">Asset Allocation</h3>
                        <AllocationChart data={displayAllocation} isRealMode={props.isRealMode} />
                        <div className="flex justify-center gap-2 mt-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-[#0B1121] border border-white/5 rounded-2xl border-dashed">
                    <div className="p-4 bg-slate-800 rounded-full">
                        <Wallet className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Real Mode Locked</h3>
                        <p className="text-slate-400 max-w-md mx-auto">
                            Connect your wallet to view live financial data, runway forecasts, and shadow spend alerts.
                        </p>
                    </div>
                    <button
                        onClick={props.connectWallet}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20"
                    >
                        Connect Wallet to Unlock
                    </button>
                </div>
            )}
        </div>
    );
}
