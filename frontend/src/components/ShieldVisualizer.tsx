"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Transaction } from "./ActivityFeed";

export function ShieldVisualizer() {
    const [status, setStatus] = useState<"IDLE" | "BLOCKING" | "PASSING">("IDLE");
    const [lastTx, setLastTx] = useState<Transaction | null>(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const channel = supabase
            .channel('shield-visualizer')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
                const newTx = payload.new as Transaction;
                setLastTx(newTx);

                if (newTx.status === "BLOCKED" || newTx.status === "ERROR") {
                    setStatus("BLOCKING");
                } else {
                    setStatus("PASSING");
                }

                // Clear any existing reset timeout
                if (timeoutId) clearTimeout(timeoutId);

                // Reset to IDLE after animation
                timeoutId = setTimeout(() => setStatus("IDLE"), 3000);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className="relative flex items-center justify-center h-64 w-64 mx-auto my-8">
            {/* Core Shield */}
            <motion.div
                animate={{
                    scale: status === "BLOCKING" ? [1, 1.2, 1] : status === "PASSING" ? [1, 0.9, 1] : [1, 1.05, 1],
                    filter: status === "BLOCKING"
                        ? "drop-shadow(0 0 20px #ef4444)"
                        : status === "PASSING"
                            ? "drop-shadow(0 0 20px #22c55e)"
                            : "drop-shadow(0 0 10px #06b6d4)"
                }}
                transition={{ duration: status === "IDLE" ? 2 : 0.5, repeat: status === "IDLE" ? Infinity : 0 }}
                className="relative z-10"
            >
                {status === "BLOCKING" ? (
                    <ShieldAlert className="w-32 h-32 text-cyber-red" strokeWidth={1} />
                ) : status === "PASSING" ? (
                    <ShieldCheck className="w-32 h-32 text-cyber-green" strokeWidth={1} />
                ) : (
                    <Shield className="w-32 h-32 text-cyber-cyan" strokeWidth={1} />
                )}
            </motion.div>

            {/* Ripple Effects */}
            <AnimatePresence>
                {status === "BLOCKING" && (
                    <motion.div
                        initial={{ scale: 1, opacity: 0.8, borderColor: "#ef4444" }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-full border-4 border-cyber-red z-0"
                    />
                )}
                {status === "PASSING" && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0.8, borderColor: "#22c55e" }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-full border-4 border-cyber-green z-0"
                    />
                )}
            </AnimatePresence>

            {/* Status Text */}
            <div className="absolute -bottom-12 text-center w-full">
                <motion.div
                    key={status}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs font-bold tracking-[0.2em] uppercase ${status === "BLOCKING" ? "text-cyber-red neon-text-red" :
                        status === "PASSING" ? "text-cyber-green" :
                            "text-cyber-cyan neon-text-cyan"
                        }`}
                >
                    {status === "IDLE" ? "SYSTEM MONITORING" : status === "BLOCKING" ? "THREAT BLOCKED" : "TRAFFIC ALLOWED"}
                </motion.div>
                {lastTx && status !== "IDLE" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-gray-500 mt-1 font-mono"
                    >
                        {lastTx.function_selector}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
