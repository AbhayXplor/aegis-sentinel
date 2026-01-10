import { ThreatMap } from "../ThreatMap";
import { ShieldVisualizer } from "../ShieldVisualizer";
import { ActivityFeed } from "../ActivityFeed";
import { PageHeader } from "../PageHeader";
import { Shield, Activity, Map as MapIcon } from "lucide-react";

export function SecurityView() {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Security Center"
                subtitle="Global threat monitoring and real-time transaction audit logs."
            />

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
                            <ThreatMap />
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
                            <ActivityFeed />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
