"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Aegis CFO
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Features
                    </Link>
                    <Link href="https://github.com/AbhayXplor/aegis-prime" target="_blank" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        GitHub
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                    >
                        Launch App
                    </Link>
                </div>
            </div>
        </nav>
    );
}
