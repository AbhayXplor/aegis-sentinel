"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { WalletStatus } from "@/components/WalletStatus";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { PolicyChat } from "@/components/PolicyChat";
import SimulationControl from "@/components/SimulationControl";
import { ShieldVisualizer } from "@/components/ShieldVisualizer";
import { getETHBalance, getMNEEBalance } from "@/lib/blockchain";
import { ShieldCheck, Lock, LayoutDashboard, AlertOctagon } from "lucide-react";
import { ThreatMap } from "@/components/ThreatMap";
import { MetricsWidgets } from "@/components/MetricsWidgets";
import { DemoController } from "@/components/DemoController";

export default function Home() {
  const [ethBalance, setEthBalance] = useState("0.00");
  const [mneeBalance, setMneeBalance] = useState("0.00");
  const [vaultBalance, setVaultBalance] = useState("0.00");
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRealMode, setIsRealMode] = useState(false);
  const [demoPhase, setDemoPhase] = useState(0);
  const [simulatedBalance, setSimulatedBalance] = useState<string | null>(null);

  const MNEE_ADDRESS = isRealMode
    ? "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF"
    : (process.env.NEXT_PUBLIC_MNEE_ADDRESS || "");

  // 1. Connect Wallet Function
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Connection failed", error);
      }
    } else {
      alert("Please install MetaMask to use Aegis Prime.");
    }
  };

  // 2. Fetch Data (Only if connected)
  useEffect(() => {
    if (!userAddress) return;

    async function fetchData() {
      if (!userAddress) return;
      console.log(`Fetching ${isRealMode ? 'REAL' : 'DEMO'} balances for:`, userAddress);

      const eth = await getETHBalance(userAddress, isRealMode);
      setEthBalance(eth);

      if (MNEE_ADDRESS) {
        const mnee = await getMNEEBalance(userAddress, MNEE_ADDRESS, isRealMode);
        setMneeBalance(mnee);
        if (simulatedBalance === null) setSimulatedBalance(mnee); // Init sim balance

        // Fetch Vault Balance (AegisGuard)
        const AEGIS_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;
        if (AEGIS_ADDRESS) {
          const vault = await getMNEEBalance(AEGIS_ADDRESS, MNEE_ADDRESS, isRealMode);
          setVaultBalance(vault);
        }
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll balances every 5s
    return () => clearInterval(interval);
  }, [userAddress, MNEE_ADDRESS, isRealMode]);

  // Reset sim balance when real balance changes significantly (or just on mode switch)
  useEffect(() => {
    setSimulatedBalance(null);
  }, [isRealMode]);

  // 3. Auto-connect on load if already authorized
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setUserAddress(accounts[0].address);
          setIsConnected(true);
        }
      }
    };
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen pb-32 bg-[#020617] text-zinc-50 font-sans selection:bg-blue-500/30 flex flex-col relative">

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full mb-6 flex items-center justify-between border-b border-white/5 pb-4 pt-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Aegis <span className="text-zinc-500 font-light italic">Prime</span>
            </h1>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Autonomous Security Protocol</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setIsRealMode(false)}
              className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${!isRealMode ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Demo
            </button>
            <button
              onClick={() => setIsRealMode(true)}
              className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${isRealMode ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Real
            </button>
          </div>

          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-full transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex gap-2">
              <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/10 flex items-center gap-2 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Live</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex gap-2 mb-4 max-w-7xl mx-auto w-full">
        <div className="px-2.5 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
          <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">System Online</span>
        </div>
        <div className="px-2.5 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
          <Lock className="w-2.5 h-2.5 text-zinc-400" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Enclave Active</span>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

        {/* Left Column: Intel & Assets (3 cols) */}
        <div className="lg:col-span-3 space-y-6 flex flex-col overflow-y-auto pr-2 custom-scrollbar">
          <MetricsWidgets
            balance={simulatedBalance || mneeBalance}
            demoPhase={demoPhase}
          />

          <WalletStatus
            balance={simulatedBalance || mneeBalance}
            ethBalance={ethBalance}
            address={userAddress || "Not Connected"}
            riskLevel="LOW"
            isConnected={isConnected}
            isRealMode={isRealMode}
            vaultBalance={vaultBalance}
          />
        </div>

        {/* Center Column: Command Map (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6 relative">
          {/* Hero Map Section */}
          <div className="flex-1 relative min-h-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#020617]">
            <ThreatMap />

            {/* Overlay Shield Visualizer */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
              <div className="scale-75 opacity-80">
                <ShieldVisualizer />
              </div>
            </div>

            {/* Phase Status Overlay */}
            <div className="absolute top-6 right-6 z-20">
              {demoPhase === 1 && (
                <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-md animate-pulse flex items-center gap-3">
                  <AlertOctagon className="w-5 h-5 text-red-500" />
                  <span className="text-xs font-bold text-red-200 uppercase tracking-widest">Rogue Agent Detected</span>
                </div>
              )}
            </div>
          </div>

          {/* Simulation Controls (Hidden in Demo Mode usually, but kept for manual override) */}
          <div className="h-auto">
            <SimulationControl isRealMode={isRealMode} />
          </div>
        </div>

        {/* Right Column: Comms & Logs (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="h-[400px]">
            <ActivityFeed />
          </div>
          <div className="flex-1 min-h-[400px]">
            <PolicyChat />
          </div>
        </div>

      </main>

      {/* Analytics Section */}
      <section className="max-w-[1600px] mx-auto w-full mt-12 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-white/10" />
          <h2 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] px-4">System Intelligence & Analytics</h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <AnalyticsDashboard />
      </section>

      {/* Floating Demo Controller */}
      <DemoController
        onPhaseChange={setDemoPhase}
        currentBalance={simulatedBalance || mneeBalance}
        setSimulatedBalance={setSimulatedBalance}
      />
    </div>
  );
}
