"use client";

import { useState, useEffect } from "react";
import { Play, Square, Zap } from "lucide-react";
import { supabase } from "../lib/supabase";

interface SimulationControlProps {
    isRealMode?: boolean;
    isPaused?: boolean;
}

export function SimulationControl({ isRealMode = false, isPaused = false }: SimulationControlProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState("IDLE");
    const [attackType, setAttackType] = useState("PAYROLL");

    // 1. Sync with Supabase State
    useEffect(() => {
        const fetchState = async () => {
            const { data } = await supabase.from('simulation_state').select('is_running').eq('id', 1).single();
            if (data) setIsRunning(data.is_running);
        };
        fetchState();

        const channel = supabase
            .channel('sim-control')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'simulation_state' }, (payload) => {
                setIsRunning(payload.new.is_running);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // 2. Trigger Agent Loop
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let active = true;

        const runSimulation = async () => {
            if (!isRunning || !active) return;

            if (isPaused) {
                setStatus("SYSTEM PAUSED");
                if (active && isRunning) {
                    timeoutId = setTimeout(runSimulation, 2000); // Check again in 2s
                }
                return;
            }

            setStatus(attackType === 'PAYROLL' ? "PROCESSING PAYROLL..." : "UNAUTHORIZED TRANSFER DETECTED...");
            try {
                await fetch('/api/rogue-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: attackType === 'PAYROLL' ? 'RANDOM' : 'ATTACK', type: attackType })
                });
            } catch (e) {
                console.error("Agent Error:", e);
            }

            if (active && isRunning) {
                timeoutId = setTimeout(runSimulation, 1000); // Wait 1s between attacks
            }
        };

        if (isRunning) {
            runSimulation();
        } else {
            setStatus("IDLE");
        }

        return () => {
            active = false;
            clearTimeout(timeoutId);
        };
    }, [isRunning, isPaused, attackType]);

    // 3. Toggle Handler
    const toggleSimulation = async () => {
        if (isRealMode) return; // Prevent simulation in real mode
        const newState = !isRunning;
        await supabase.from('simulation_state').upsert({ id: 1, is_running: newState });
        setIsRunning(newState);
    };

    return (
        <div className={`glass-panel p-6 rounded-xl relative overflow-hidden group ${isRealMode ? 'opacity-50 grayscale' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-between relative z-10">
                <div>
                    <h3 className="text-sm font-bold text-white flex items-center tracking-wider">
                        <Zap className={`w-4 h-4 mr-2 ${isRunning ? 'text-accent-gold animate-pulse' : 'text-accent-blue'}`} />
                        PAYROLL AUTOMATOR
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">
                        STATUS: <span className={isRunning ? (isPaused ? "text-yellow-500 font-bold animate-pulse" : (attackType === 'PAYROLL' ? "text-accent-emerald font-bold" : "text-accent-rose font-bold")) : "text-gray-500"}>
                            {isRealMode ? "DISABLED (REAL MODE)" : (isPaused ? "SYSTEM PAUSED (KILL SWITCH)" : status)}
                        </span>
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <select
                        value={attackType}
                        onChange={(e) => setAttackType(e.target.value)}
                        disabled={isRunning || isRealMode}
                        className="bg-black/40 border border-white/10 text-xs text-gray-300 rounded px-2 py-1 focus:outline-none focus:border-accent-blue/50"
                    >
                        <option value="PAYROLL">Run Standard Payroll</option>
                        <option value="DRAINER">Compromised: Drain Treasury</option>
                    </select>

                    <button
                        onClick={toggleSimulation}
                        disabled={isRealMode}
                        className={`px-4 py-2 rounded-lg font-bold text-xs tracking-wider flex items-center transition-all duration-300 ${isRealMode
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                            : isRunning
                                ? "bg-accent-rose/20 text-accent-rose border border-accent-rose/50 hover:bg-accent-rose/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        {isRunning ? (
                            <>
                                <Square className="w-3 h-3 mr-2 fill-current" /> HALT
                            </>
                        ) : (
                            <>
                                <Play className="w-3 h-3 mr-2 fill-current" /> START
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
