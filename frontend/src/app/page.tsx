"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getETHBalance, getMNEEBalance, MNEE_ABI } from "@/lib/blockchain";
import { DemoController } from "@/components/DemoController";
import { AppShell } from "@/components/AppShell";
import { DashboardView } from "@/components/views/DashboardView";
import { PayrollView } from "@/components/views/PayrollView";
import { SecurityView } from "@/components/views/SecurityView";
import { PolicyView } from "@/components/views/PolicyView";

export default function Home() {
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

  // Check Paused State on Load & Connect
  useEffect(() => {
    if (userAddress) {
      import("@/lib/blockchain").then(({ getPausedState }) => {
        const AEGIS_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;
        if (AEGIS_ADDRESS) {
          getPausedState(AEGIS_ADDRESS).then(setIsPaused);
        }
      });
    }
  }, [userAddress]);

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

  const fetchBalances = async (address: string, provider: any) => {
    try {
      // ETH Balance
      const eth = await provider.getBalance(address);
      setEthBalance(parseFloat(ethers.formatEther(eth)).toFixed(4));

      // MNEE Balance
      const MNEE_ADDRESS = process.env.NEXT_PUBLIC_MNEE_ADDRESS;
      if (MNEE_ADDRESS) {
        const mneeContract = new ethers.Contract(MNEE_ADDRESS, MNEE_ABI, provider);
        const mnee = await mneeContract.balanceOf(address);
        setMneeBalance(parseFloat(ethers.formatEther(mnee)).toFixed(2));
      }

      // Vault Balance (Mock for demo)
      setVaultBalance("1,250,000.00");
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  };

  // Fetch Data (Only if connected)
  useEffect(() => {
    if (!userAddress || !window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    fetchBalances(userAddress, provider);
  }, [userAddress, isRealMode]);

  const renderView = () => {
    const commonProps = {
      balance: simulatedBalance || mneeBalance,
      ethBalance,
      vaultBalance,
      userAddress,
      isConnected,
      isRealMode,
      isPaused,
      setIsPaused,
      demoPhase,
      connectWallet
    };

    switch (currentView) {
      case "dashboard":
        return <DashboardView {...commonProps} />;
      case "payroll":
        return <PayrollView {...commonProps} />;
      case "security":
        return <SecurityView />;
      case "policy":
        return <PolicyView />;
      default:
        return <DashboardView {...commonProps} />;
    }
  };

  return (
    <AppShell
      currentView={currentView}
      setCurrentView={setCurrentView}
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
