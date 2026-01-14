"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    ArrowUpRight,
    CreditCard,
    Lock,
    ShieldCheck,
    Wallet,
    Plus
} from "lucide-react";
import { PageHeader } from "../PageHeader";
import { MetricCard } from "../dashboard/MetricCard";
import { TreasuryChart } from "../dashboard/TreasuryChart";
import { AllocationChart } from "../dashboard/AllocationChart";
import { WalletStatus } from "../WalletStatus";
import { MOCK_TOKEN_ADDRESS, SUPPORTED_TOKENS } from "@/lib/constants";

interface DashboardViewProps {
    isConnected: boolean;
    userAddress: string | null;
    balance: string;
    ethBalance: string;
    vaultBalance: string;
    isRealMode: boolean;
    connectWallet: () => void;
    disconnectWallet: () => void;
}

export function DashboardView(props: DashboardViewProps) {
    const [ethPrice, setEthPrice] = useState<number>(2450);
    const [isMinting, setIsMinting] = useState(false);
    const showRealData = props.isConnected;

    // Mock ETH Price fetch
    useEffect(() => {
        const getEthPrice = async () => {
            try {
                const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT");
                const data = await res.json();
                return parseFloat(data.price);
            } catch (e) {
                return 2450;
            }
        };

        getEthPrice().then(price => {
            if (price > 0) setEthPrice(price);
        });
    }, []);

    // Calculate Totals
    const aegisVal = parseFloat(props.balance);
    const ethVal = parseFloat(props.ethBalance);
    const totalAssets = ((ethVal * ethPrice) + (aegisVal * 1)).toFixed(2);

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
            const trendFactor = 1 - (i * 0.05);
            const variance = 0.9 + Math.random() * 0.2;

            let value = finalValue * trendFactor * variance;

            if (i === 0) value = finalValue;

            history.push({ date: dateName, value: Math.round(value) });
        }
        return history;
    };

    const mockHistory = generateMockHistory(parseFloat(totalAssets));

    const realHistory = [
        { date: currentMonth, value: parseFloat(totalAssets) }
    ];

    const chartData = props.isRealMode ? realHistory : mockHistory;

    const allocationData = [
        { name: 'Tokens', value: aegisVal },
        { name: 'ETH', value: ethVal * ethPrice },
    ];

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
                        </div>
                        <TreasuryChart data={chartData} isRealMode={props.isRealMode} />
                    </div>

                    {/* Row 2: Metrics */}
                    <div className="col-span-12 md:col-span-4">
                        <MetricCard
                            title="Total Assets"
                            value={`$${parseFloat(totalAssets).toLocaleString()}`}
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
                                        <li>Click <strong>Mint Demo Tokens</strong> below to get test tokens.</li>
                                        <li>Go to <strong>Settings</strong> to deposit tokens into the Vault.</li>
                                        <li>Run the <strong>Payroll Agent</strong> to see automated payments.</li>
                                    </ol>
                                    <button
                                        onClick={async () => {
                                            const { mintTokens } = await import("@/lib/blockchain");
                                            setIsMinting(true);
                                            try {
                                                await mintTokens(MOCK_TOKEN_ADDRESS, "10000");
                                                window.location.reload();
                                            } catch (e) {
                                                console.error(e);
                                            } finally {
                                                setIsMinting(false);
                                            }
                                        }}
                                        disabled={isMinting}
                                        className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isMinting ? "Minting..." : "Mint 10,000 Demo Tokens"}
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
                                    {/* Dynamic Asset List */}
                                    {SUPPORTED_TOKENS.map((token) => {
                                        // For now, we only have real balances for ETH and MNEE (mocked in props)
                                        // In a real app, we would fetch balances for all these tokens
                                        // For this hackathon, we will show 0.00 for others or mock data if needed

                                        let balance = "0.00";
                                        let value = 0;
                                        let percent = "0.00%";

                                        if (token.symbol === "ETH") {
                                            balance = props.ethBalance;
                                            value = parseFloat(props.ethBalance) * ethPrice;
                                        } else if (token.symbol === "AEGIS") {
                                            balance = props.balance;
                                            value = parseFloat(props.balance); // Stablecoin $1
                                        }

                                        if (parseFloat(totalAssets) > 0) {
                                            percent = `${(value / parseFloat(totalAssets) * 100).toFixed(2)}%`;
                                        }

                                        return (
                                            <tr key={token.symbol} className="border-b border-white/5 group hover:bg-white/[0.02]">
                                                <td className="py-4 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-white/10">
                                                        <span className="text-[10px] font-bold">{token.symbol}</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-medium">{token.name}</div>
                                                        <div className="text-xs text-slate-500">{balance} {token.symbol}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-white font-medium">${value.toFixed(2)}</td>
                                                <td className="py-4 text-right text-emerald-400 font-medium">{percent}</td>
                                            </tr>
                                        );
                                    })}

                                    {/* Vault Row (Special Case) */}
                                    <tr className="border-b border-white/5 group hover:bg-white/[0.02]">
                                        <td className="py-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">Aegis Vault</div>
                                                <div className="text-xs text-slate-500">{props.vaultBalance} AEGIS</div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-white font-medium">${props.vaultBalance}</td>
                                        <td className="py-4 text-right text-emerald-400 font-medium">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-4 bg-[#0B1121] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-6">Asset Allocation</h3>
                        <AllocationChart data={displayAllocation} isRealMode={props.isRealMode} />
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
