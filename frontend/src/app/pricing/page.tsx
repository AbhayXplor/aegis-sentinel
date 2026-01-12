"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Check, Zap, Shield, Globe } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-x-hidden">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        className="text-center mb-24"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                            Scale Your Treasury
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Choose the plan that fits your organization's needs. From early-stage startups to established protocols.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Starter */}
                        <motion.div
                            className="p-10 rounded-3xl bg-white/5 border border-white/10 flex flex-col hover:bg-white/[0.07] transition-all"
                            {...fadeInUp}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                                <p className="text-slate-400 text-sm">For small teams and DAOs</p>
                            </div>
                            <div className="text-5xl font-bold text-white mb-8">$0 <span className="text-lg text-slate-500 font-normal">/mo</span></div>

                            <ul className="space-y-5 mb-10 flex-1">
                                {[
                                    'Up to 5 Team Members',
                                    'Basic AI Policy Engine',
                                    'Standard Payroll Batching',
                                    'Community Support',
                                    'Sepolia & Mainnet Support'
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                                        <Check className="w-5 h-5 text-blue-500 shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/dashboard" className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all text-center">
                                Get Started
                            </Link>
                        </motion.div>

                        {/* Pro */}
                        <motion.div
                            className="p-10 rounded-3xl bg-blue-600/10 border border-blue-500/50 flex flex-col relative overflow-hidden ring-2 ring-blue-500/20"
                            {...fadeInUp}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl tracking-widest uppercase">MOST POPULAR</div>
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
                                <p className="text-blue-200/60 text-sm">For growing organizations</p>
                            </div>
                            <div className="text-5xl font-bold text-white mb-8">$99 <span className="text-lg text-slate-500 font-normal">/mo</span></div>

                            <ul className="space-y-5 mb-10 flex-1">
                                {[
                                    'Unlimited Team Members',
                                    'Advanced AI Risk Analysis',
                                    'Priority Threat Detection',
                                    'Custom Policy Templates',
                                    'Runway & Burn Analytics',
                                    'Priority Email Support'
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-sm text-white">
                                        <Check className="w-5 h-5 text-blue-400 shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/dashboard" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all text-center shadow-xl shadow-blue-500/25">
                                Start 14-Day Trial
                            </Link>
                        </motion.div>

                        {/* Enterprise */}
                        <motion.div
                            className="p-10 rounded-3xl bg-white/5 border border-white/10 flex flex-col hover:bg-white/[0.07] transition-all"
                            {...fadeInUp}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                                <p className="text-slate-400 text-sm">For institutional protocols</p>
                            </div>
                            <div className="text-5xl font-bold text-white mb-8">Custom</div>

                            <ul className="space-y-5 mb-10 flex-1">
                                {[
                                    'Custom Smart Contract Logic',
                                    'Dedicated Account Manager',
                                    'On-Premise Deployment',
                                    'SLA & Uptime Guarantees',
                                    'Advanced Audit Logs',
                                    'White-label Dashboard'
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                                        <Check className="w-5 h-5 text-blue-500 shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all text-center">
                                Contact Sales
                            </button>
                        </motion.div>
                    </div>

                    {/* Trust Badge */}
                    <motion.div
                        className="mt-24 p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center"
                        {...fadeInUp}
                    >
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-6">Secured by industry leaders</p>
                        <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale">
                            {/* Mock Logos */}
                            {['Gnosis Safe', 'Chainlink', 'OpenZeppelin', 'Quantstamp'].map((name) => (
                                <span key={name} className="text-xl font-black text-white">{name}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
