"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getETHBalance, getMNEEBalance, getPausedState, switchNetwork } from "@/lib/blockchain";
import { MOCK_MNEE_ADDRESS, REAL_MNEE_ADDRESS, MNEE_ABI } from "@/lib/constants";
import { DemoController } from "@/components/DemoController";
import { AppShell } from "@/components/AppShell";
import { DashboardView } from "@/components/views/DashboardView";
import { PayrollView } from "@/components/views/PayrollView";
import { SecurityView } from "@/components/views/SecurityView";
import { PolicyView } from "@/components/views/PolicyView";
import { SettingsView } from "@/components/views/SettingsView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { ConnectWalletState } from "@/components/ConnectWalletState";

export default function Dashboard() {
    const [currentView, setCurrentView] = useState("dashboard");
    const [ethBalance, setEthBalance] = useState("0.00");
    const [mneeBalance, setMneeBalance] = useState("0.00");
    const [vaultBalance, setVaultBalance] = useState("0.00");
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isRealMode, setIsRealMode] = useState(false);
    const [demoPhase, setDemoPhase] = useState(0);
    const [simulatedBalance, setSimulatedBalance] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Connect Wallet Function
    const connectWallet = async () => {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                if (accounts.length > 0) {
                    setUserAddress(accounts[0]);
                    setIsConnected(true);
                    fetchBalances(accounts[0], provider);
                }
            } catch (error) {
                console.error("Connection failed", error);
            }
        } else {
            alert("Please install MetaMask to use Aegis Prime.");
        }
    };

    const disconnectWallet = () => {
        setUserAddress(null);
        setIsConnected(false);
        setEthBalance("0.00");
        setMneeBalance("0.00");
    };

    const handleModeSwitch = async (real: boolean) => {
        setIsRealMode(real);
        await switchNetwork(real);
        // Re-fetch balances after switch
        if (userAddress && window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            fetchBalances(userAddress, provider);
        }
    };

    const fetchBalances = async (address: string, provider: any) => {
        // Reset balances to prevent stale data when switching modes/networks
        setMneeBalance("0.00");
        setVaultBalance("0.00");

        try {
            // ETH Balance
            const eth = await provider.getBalance(address);
            setEthBalance(parseFloat(ethers.formatEther(eth)).toFixed(4));

            // MNEE Balance
            // Use Real address if in Real Mode, otherwise Mock
            const MNEE_ADDRESS = isRealMode ? REAL_MNEE_ADDRESS : MOCK_MNEE_ADDRESS;

            if (MNEE_ADDRESS) {
                const mneeContract = new ethers.Contract(MNEE_ADDRESS, MNEE_ABI, provider);
                const mnee = await mneeContract.balanceOf(address);
                setMneeBalance(parseFloat(ethers.formatEther(mnee)).toFixed(2));
            }

            // Vault Balance
            const AEGIS_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;
            if (AEGIS_ADDRESS && MNEE_ADDRESS) {
                const mneeContract = new ethers.Contract(MNEE_ADDRESS, MNEE_ABI, provider);
                const vault = await mneeContract.balanceOf(AEGIS_ADDRESS);
                setVaultBalance(parseFloat(ethers.formatEther(vault)).toFixed(2));
            }
        } catch (err) {
            console.error("Error fetching balances:", err);
        }
    };

    useEffect(() => {
        // Check if user has visited before or just default to landing
        // For now, always show landing on refresh for the "wow" factor
    }, []);

    // Check Paused State on Load & Connect
    useEffect(() => {
        if (userAddress) {
            const AEGIS_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;
            if (AEGIS_ADDRESS) {
                getPausedState(AEGIS_ADDRESS).then(setIsPaused);
            }
        }
    }, [userAddress]);

    // Fetch Data (Only if connected)
    useEffect(() => {
        if (!userAddress || !window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        fetchBalances(userAddress, provider);
    }, [userAddress, isRealMode]);

    // Clear simulated balance when switching to Real Mode
    useEffect(() => {
        if (isRealMode) {
            setSimulatedBalance(null);
        }
    }, [isRealMode]);

    const renderView = () => {
        // Global Wallet Gate: Require connection for all views
        if (!isConnected) {
            return <ConnectWalletState onConnect={connectWallet} />;
        }

        const commonProps = {
            balance: isRealMode ? mneeBalance : (simulatedBalance || mneeBalance),
            ethBalance,
            vaultBalance,
            userAddress,
            isConnected,
            isRealMode,
            isPaused,
            setIsPaused,
            demoPhase,
            connectWallet,
            disconnectWallet
        };

        switch (currentView) {
            case "dashboard":
                return <DashboardView {...commonProps} />;
            case "payroll":
                return <PayrollView {...commonProps} />;
            case "security":
                return <SecurityView isRealMode={isRealMode} />;
            case "policy":
                return <PolicyView />;
            case "analytics":
                return <AnalyticsView isRealMode={isRealMode} />;
            case "settings":
                return <SettingsView />;
            default:
                return <DashboardView {...commonProps} />;
        }
    };

    return (
        <AppShell
            currentView={currentView}
            setCurrentView={setCurrentView}
            isRealMode={isRealMode}
            setIsRealMode={handleModeSwitch}
            demoProps={{
                onPhaseChange: setDemoPhase,
                currentBalance: simulatedBalance || mneeBalance,
                setSimulatedBalance: setSimulatedBalance,
                isPaused: isPaused
            }}
        >
            {renderView()}
        </AppShell>
    );
}
