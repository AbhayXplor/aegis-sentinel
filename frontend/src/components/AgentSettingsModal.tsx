"use client";

import { useState, useEffect } from "react";
import { X, Save, Clock, ShieldAlert, RefreshCw } from "lucide-react";

interface AgentSettings {
    checkFrequency: number; // in minutes
    maxTransactionLimit: string;
    retryAttempts: number;
    enabled: boolean;
}

interface AgentSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: AgentSettings) => void;
    initialSettings: AgentSettings;
}

export function AgentSettingsModal({ isOpen, onClose, onSave, initialSettings }: AgentSettingsModalProps) {
    const [settings, setSettings] = useState<AgentSettings>(initialSettings);

    useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0B0E14] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-blue-400" />
                        Autopilot Configuration
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Frequency Setting */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            Check Frequency
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[15, 60, 1440].map((mins) => (
                                <button
                                    key={mins}
                                    onClick={() => setSettings({ ...settings, checkFrequency: mins })}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${settings.checkFrequency === mins
                                        ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                        }`}
                                >
                                    {mins === 1440 ? "Daily" : mins === 60 ? "Hourly" : "Every 15m"}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-500">
                            How often the agent scans for due payments.
                        </p>
                    </div>

                    {/* Max Transaction Limit */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-400" />
                            Safety Cap (Per Run)
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={settings.maxTransactionLimit}
                                onChange={(e) => setSettings({ ...settings, maxTransactionLimit: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                placeholder="e.g. 5000"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">Tokens</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                            Agent will pause if total volume exceeds this amount.
                        </p>
                    </div>

                    {/* Retry Attempts */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-emerald-400" />
                            Retry Attempts
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0"
                                max="5"
                                step="1"
                                value={settings.retryAttempts}
                                onChange={(e) => setSettings({ ...settings, retryAttempts: parseInt(e.target.value) })}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <span className="text-sm font-mono text-blue-400 w-8 text-center">{settings.retryAttempts}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/5">
                    <button
                        onClick={() => onSave(settings)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}
