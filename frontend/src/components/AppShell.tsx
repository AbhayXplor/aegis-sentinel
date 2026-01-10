"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
    children: ReactNode;
    currentView: string;
    setCurrentView: (view: string) => void;
    demoProps?: any; // Using any for simplicity here, but ideally typed
}

export function AppShell({ children, currentView, setCurrentView, demoProps }: AppShellProps) {
    return (
        <div className="min-h-screen flex bg-[#020617] text-slate-50">
            {/* Fixed Sidebar */}
            <aside className="w-64 fixed inset-y-0 left-0 z-50 border-r border-white/10 bg-[#020617]">
                <Sidebar
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    demoProps={demoProps}
                />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 min-h-screen">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
