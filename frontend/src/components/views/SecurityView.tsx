import { useState } from "react";
import { ThreatMap } from "../ThreatMap";
import { ShieldVisualizer } from "../ShieldVisualizer";
import { ActivityFeed } from "../ActivityFeed";
import { PageHeader } from "../PageHeader";
import { PolicyChat } from "../PolicyChat";
import { Shield, Activity, Map as MapIcon, FileText, Zap, Info, ShieldAlert, MessageSquare } from "lucide-react";

interface SecurityViewProps {
    isRealMode?: boolean;
}

export function SecurityView({ isRealMode = false }: SecurityViewProps) {
    const [activeTab, setActiveTab] = useState<"monitor" | "policy">("monitor");

    return (
        <div className="space-y-8">
            <PageHeader
                title="Security Center"
                subtitle="Global threat monitoring and AI-driven policy enforcement."
                action={
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setActiveTab("monitor")}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "monitor"
                                ? "bg-blue-600 text-white shadow-lg"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            Threat Monitor
                        </button>
                        <button
                            onClick={() => setActiveTab("policy")}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "policy"
                                ? "bg-blue-600 text-white shadow-lg"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            Policy Engine
                        </button>
                    </div>
                }
            />

            {activeTab === "monitor" ? (
                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column: Threat Monitoring (8 cols) */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        {/* Threat Map Card */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <MapIcon className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Global Threat Map</h3>
                                        <p className="text-[10px] text-slate-500 font-medium">Real-time attempt visualization</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Live Monitoring</span>
                                </div>
                            </div>
                            <div className="h-[400px] relative">
                                {isRealMode ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                                        No active threats detected in Real Mode.
                                    </div>
                                ) : (
                                    <ThreatMap />
                                )}
                            </div>
                        </div>

                        {/* Shield Status Card */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <Shield className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Aegis Shield Status</h3>
                                    <p className="text-[10px] text-slate-500 font-medium">Active protocol enforcement</p>
                                </div>
                            </div>
                            <div className="p-8 flex justify-center items-center bg-slate-950/30">
                                <ShieldVisualizer />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Audit Logs (4 cols) */}
                    <div className="col-span-12 lg:col-span-4 h-full">
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col h-[calc(100vh-280px)] sticky top-8">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <Activity className="w-4 h-4 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Audit Log</h3>
                                    <p className="text-[10px] text-slate-500 font-medium">System-wide event stream</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                {isRealMode ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm p-4 text-center">
                                        Real-time audit log is clear.
                                    </div>
                                ) : (
                                    <ActivityFeed />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-12 gap-8 h-[calc(100vh-200px)]">
                    {/* Left Column: Chat Interface (9 cols) */}
                    <div className="col-span-12 lg:col-span-9 flex flex-col min-h-0">
                        <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <MessageSquare className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Policy Assistant</h3>
                                        <p className="text-[10px] text-slate-500 font-medium">Natural language mandate configuration</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md">
                                    <Zap className="w-3 h-3 text-blue-400" />
                                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">AI Powered</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                <PolicyChat />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Templates & Info (3 cols) */}
                    <div className="col-span-12 lg:col-span-3 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                        {/* Quick Templates */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Zap className="w-3 h-3 text-amber-400" /> Quick Templates
                            </h3>
                            <div className="space-y-3">
                                {[
                                    "Only allow payroll to whitelisted employees",
                                    "Block all transfers over 50,000 tokens",
                                    "Require 2FA for any policy changes",
                                    "Whitelist OpenAI for API payments"
                                ].map((template, i) => (
                                    <button
                                        key={i}
                                        className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                                    >
                                        <p className="text-[11px] text-slate-300 group-hover:text-white leading-relaxed">"{template}"</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AI Assistant Info */}
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 backdrop-blur-md">
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Info className="w-3 h-3" /> How it works
                            </h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                                Aegis CFO uses Gemini 2.5 Flash to translate your business mandates into on-chain security policies.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
