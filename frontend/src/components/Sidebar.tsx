"use client";

import { DemoController } from "./DemoController";
import { Home, DollarSign, Shield, FileText, Settings, Activity } from "lucide-react";

interface SidebarProps {
    currentView: string;
    setCurrentView: (view: string) => void;
    isRealMode: boolean;
    setIsRealMode: (real: boolean) => void;
    demoProps?: {
        onPhaseChange: (phase: number) => void;
        currentBalance: string;
        setSimulatedBalance: (balance: string) => void;
        isPaused: boolean;
    }
}

export function Sidebar({ currentView, setCurrentView, isRealMode, setIsRealMode, demoProps }: SidebarProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: Home },
        { id: 'payroll', label: 'Payroll', icon: DollarSign },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'analytics', label: 'Analytics', icon: Activity },
    ];

    return (
        <div className="flex flex-col h-full bg-[#020617] border-r border-white/10">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-white/10 justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-sm tracking-tight">Aegis CFO</span>
                </div>
            </div>

            {/* Mode Switcher */}
            <div className="px-4 py-4 border-b border-white/10">
                <div className="bg-white/5 p-1 rounded-lg flex items-center">
                    <button
                        onClick={() => setIsRealMode(false)}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${!isRealMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Demo
                    </button>
                    <button
                        onClick={() => setIsRealMode(true)}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${isRealMode ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Real
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                ? "bg-blue-600 text-white"
                                : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 space-y-4">
                {!isRealMode && demoProps && (
                    <DemoController
                        {...demoProps}
                        className="w-full"
                    />
                )}

                <button
                    onClick={() => setCurrentView('settings')}
                    className="flex items-center gap-3 w-full px-2 py-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-medium text-white">
                        AU
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-xs font-medium text-white">Admin User</div>
                        <div className="text-[10px] text-slate-500">Aegis System</div>
                    </div>
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
