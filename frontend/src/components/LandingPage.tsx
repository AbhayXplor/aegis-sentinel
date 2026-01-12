"use client";

import { useState } from "react";
import { ArrowRight, Shield, Zap, Lock, Globe, CheckCircle } from "lucide-react";

interface LandingPageProps {
    onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-[#0B0E14] text-white overflow-hidden relative selection:bg-blue-500/30">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Navbar */}
            <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Aegis</span>
                </div>
                <button
                    onClick={onEnter}
                    className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all backdrop-blur-sm"
                >
                    Launch App
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
                    <Zap className="w-3 h-3" />
                    <span>The Future of Corporate Treasury</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 animate-fade-in-up delay-100">
                    Autonomous Finance <br />
                    <span className="text-blue-500">with Superpowers.</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
                    Aegis is the first AI-native CFO that manages your crypto treasury.
                    Automate payroll, enforce spending policies, and audit transactions
                    with a dedicated on-chain agent.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                    <button
                        onClick={onEnter}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 group"
                    >
                        <span>Launch App</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="flex flex-col items-start gap-2 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm text-left max-w-xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                            <Zap className="w-3 h-3" /> Demo Instructions
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            1. Launch App & Connect Wallet (Sepolia).<br />
                            2. Click <strong>"Mint Demo MNEE"</strong> in Dashboard.<br />
                            3. Deposit to Vault & Run Payroll Agent.
                        </p>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 text-left">
                    <FeatureCard
                        icon={<Globe className="w-6 h-6 text-blue-400" />}
                        title="Global Payroll"
                        description="Pay your team in seconds with MNEE. Automated, compliant, and instant."
                    />
                    <FeatureCard
                        icon={<Lock className="w-6 h-6 text-emerald-400" />}
                        title="Vault Security"
                        description="Funds are secured in a smart contract vault. Policies are enforced on-chain."
                    />
                    <FeatureCard
                        icon={<Zap className="w-6 h-6 text-amber-400" />}
                        title="AI Agent"
                        description="Delegate tasks to an autonomous agent. It works 24/7 so you don't have to."
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-md py-8">
                <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
                    &copy; 2026 Aegis Finance. Built for MNEE Hackathon.
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all hover:bg-white/10 group">
            <div className="w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}
