"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Shield, Zap, Brain, Lock, Globe, BarChart3, CheckCircle2 } from "lucide-react";

export default function FeaturesPage() {
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
                            Institutional Grade <br /> Treasury Controls
                        </h1>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            Aegis Prime combines the speed of an agentic workflow with the security of a multi-signature vault. Manage your organization's wealth with confidence.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                        {[
                            {
                                icon: Brain,
                                title: "AI Policy Analysis",
                                desc: "Our LLM-powered engine analyzes your spending requests against your defined policies, identifying potential risks before they become losses."
                            },
                            {
                                icon: Zap,
                                title: "Autonomous Payroll",
                                desc: "Schedule recurring payments to contributors and employees. Aegis handles the batching and execution automatically."
                            },
                            {
                                icon: Shield,
                                title: "Programmable Guardrails",
                                desc: "Set hard limits on spending, whitelist specific addresses, and enforce time-locks on large treasury movements."
                            },
                            {
                                icon: BarChart3,
                                title: "Real-Time Analytics",
                                desc: "Get a unified view of your treasury across multiple chains. Track burn rates, runway, and asset allocation in real-time."
                            },
                            {
                                icon: Globe,
                                title: "Cross-Chain Treasury",
                                desc: "Seamlessly manage assets across Ethereum, L2s, and sidechains from a single, secure interface."
                            },
                            {
                                icon: Lock,
                                title: "Secure Custody",
                                desc: "Integrates with industry-standard wallets and multisig solutions to ensure your private keys never leave your control."
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-blue-500/50 transition-all group"
                                {...fadeInUp}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-7 h-7 text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Detailed Feature Breakdown */}
                    <div className="space-y-32">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <motion.div className="flex-1" {...fadeInUp}>
                                <h2 className="text-4xl font-bold mb-6">The Aegis Security Stack</h2>
                                <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                    Most treasury tools focus on convenience. We focus on survival. Our security stack is designed to protect you from both external hackers and internal mistakes.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        "On-chain policy enforcement via AegisGuard",
                                        "Off-chain AI risk assessment layer",
                                        "Real-time transaction monitoring and blocking",
                                        "Multi-sig integration for high-value actions"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-slate-300">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div className="flex-1" {...fadeInUp}>
                                <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                                    <img src="/aegis_security_shield_1768213680104.png" alt="Security Stack" className="w-full h-auto" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
