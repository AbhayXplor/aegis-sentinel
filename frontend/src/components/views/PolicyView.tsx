import { PolicyChat } from "../PolicyChat";
import { PageHeader } from "../PageHeader";
import { MessageSquare, Zap, Info, ShieldAlert } from "lucide-react";

export function PolicyView() {
    return (
        <div className="flex flex-col h-[calc(100vh-120px)] space-y-8">
            <PageHeader
                title="Policy Engine"
                subtitle="Define and enforce natural language treasury mandates with AI-powered validation."
            />

            <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">
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
                                "Block all transfers over 50,000 MNEE",
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
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-none" />
                                <p className="text-[10px] text-slate-500">Policies are enforced at the smart contract level.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-none" />
                                <p className="text-[10px] text-slate-500">Real-time simulation prevents policy conflicts.</p>
                            </div>
                        </div>
                    </div>

                    {/* Security Warning */}
                    <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                            <ShieldAlert className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Security Note</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            Emergency overrides are always available via the Kill Switch on the Dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
