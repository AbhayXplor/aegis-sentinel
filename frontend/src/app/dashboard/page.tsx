"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getETHBalance, getPausedState, switchNetwork, getTokenBalance } from "@/lib/blockchain";
import { MOCK_TOKEN_ADDRESS, REAL_TOKEN_ADDRESS, TOKEN_ABI } from "@/lib/constants";
import { Sidebar } from "@/components/Sidebar";
import { DashboardView } from "@/components/views/DashboardView";
import { PayrollView } from "@/components/views/PayrollView";
import { SecurityView } from "@/components/views/SecurityView";
import { SettingsView } from "@/components/views/SettingsView";
import { WalletStatus } from "@/components/WalletStatus";
import { MetricsWidgets } from "@/components/MetricsWidgets";
import { SimulationControl } from "@/components/SimulationControl";
import { Loader2, ShieldAlert } from "lucide-react";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isRealMode, setIsRealMode] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [ethBalance, setEthBalance] = useState("0.00");
    const [tokenBalance, setTokenBalance] = useState("0.00");
    const [vaultBalance, setVaultBalance] = useState("0.00");
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [simulatedBalance, setSimulatedBalance] = useState<string | null>(null);

    const AEGIS_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;

    useEffect(() => {
        checkConnection();
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts: string[]) => {
                setAddress(accounts[0] || null);
            });
            window.ethereum.on("chainChanged", () => {
                window.location.reload();
            });
        }
    }, []);

    useEffect(() => {
        if (address) {
            fetchBalances();
            const interval = setInterval(fetchBalances, 10000);
            return () => clearInterval(interval);
        }
    }, [address, isRealMode]);

    const checkConnection = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            setAddress(accounts[0] || null);
        }
        setIsLoading(false);
    };

    const fetchBalances = async () => {
        if (!address) return;

        try {
            const eth = await getETHBalance(address, isRealMode);
            setEthBalance(parseFloat(eth).toFixed(4));

            const provider = new ethers.BrowserProvider(window.ethereum);

            // Token Balance
            const TOKEN_ADDRESS = isRealMode ? REAL_TOKEN_ADDRESS : MOCK_TOKEN_ADDRESS;

            if (TOKEN_ADDRESS) {
                const balance = await getTokenBalance(address, TOKEN_ADDRESS, isRealMode);
                setTokenBalance(parseFloat(balance).toFixed(2));
            }

            // Vault Balance
            if (AEGIS_ADDRESS && TOKEN_ADDRESS) {
                const vault = await getTokenBalance(AEGIS_ADDRESS, TOKEN_ADDRESS, isRealMode);
                setVaultBalance(parseFloat(vault).toFixed(2));
            }

            if (AEGIS_ADDRESS) {
                const paused = await getPausedState(AEGIS_ADDRESS, isRealMode);
                setIsPaused(paused);
            }
        } catch (error) {
            console.error("Error fetching balances:", error);
        }
    };

    const handleModeToggle = async (real: boolean) => {
        setIsLoading(true);
        try {
            await switchNetwork(real);
            setIsRealMode(real);
            // Reset balances while switching
            setEthBalance("0.00");
            setTokenBalance("0.00");
            setVaultBalance("0.00");
        } catch (error) {
            console.error("Failed to switch mode:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans selection:bg-blue-500/30">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-6">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => handleModeToggle(false)}
                                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${!isRealMode ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"}`}
                            >
                                Demo Mode
                            </button>
                            <button
                                onClick={() => handleModeToggle(true)}
                                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${isRealMode ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"}`}
                            >
                                Real Mode
                            </button>
                        </div>

                        {isPaused && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 animate-pulse">
                                <ShieldAlert className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Vault Paused</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {!isRealMode && (
                            <SimulationControl
                                isRealMode={isRealMode}
                                onBalanceUpdate={(val: string | null) => setSimulatedBalance(val)}
                            />
                        )}
                        <WalletStatus address={address} isRealMode={isRealMode} />
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
                        <MetricsWidgets
                            balance={isRealMode ? tokenBalance : (simulatedBalance || tokenBalance)}
                            vaultBalance={vaultBalance}
                            isRealMode={isRealMode}
                        />

                        {activeTab === "dashboard" && (
                            <DashboardView
                                balance={isRealMode ? tokenBalance : (simulatedBalance || tokenBalance)}
                                vaultBalance={vaultBalance}
                                ethBalance={ethBalance}
                                isRealMode={isRealMode}
                                isConnected={!!address}
                                userAddress={address}
                                connectWallet={() => window.ethereum?.request({ method: "eth_requestAccounts" })}
                                disconnectWallet={() => setAddress(null)}
                            />
                        )}
                        {activeTab === "payroll" && (
                            <PayrollView
                                isRealMode={isRealMode}
                                isPaused={isPaused}
                                balance={isRealMode ? tokenBalance : (simulatedBalance || tokenBalance)}
                            />
                        )}
                        {activeTab === "security" && <SecurityView isRealMode={isRealMode} />}
                        {activeTab === "settings" && <SettingsView isRealMode={isRealMode} isPaused={isPaused} />}
                    </div>
                </div>
            </main>
        </div>
    );
}
