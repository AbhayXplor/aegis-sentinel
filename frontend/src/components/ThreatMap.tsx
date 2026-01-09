"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface ThreatPoint {
    id: string;
    x: number;
    y: number;
    type: "blocked" | "allowed";
}

export function ThreatMap() {
    const [threats, setThreats] = useState<ThreatPoint[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Safe zones (approximate % of width/height for major landmasses)
    const SAFE_ZONES = [
        { xMin: 0.15, xMax: 0.30, yMin: 0.25, yMax: 0.45 }, // North America
        { xMin: 0.20, xMax: 0.32, yMin: 0.55, yMax: 0.80 }, // South America
        { xMin: 0.45, xMax: 0.55, yMin: 0.20, yMax: 0.40 }, // Europe
        { xMin: 0.55, xMax: 0.85, yMin: 0.25, yMax: 0.55 }, // Asia
        { xMin: 0.48, xMax: 0.60, yMin: 0.45, yMax: 0.70 }, // Africa
        { xMin: 0.75, xMax: 0.90, yMin: 0.65, yMax: 0.85 }, // Australia
    ];

    const getRandomLocation = (width: number, height: number) => {
        const zone = SAFE_ZONES[Math.floor(Math.random() * SAFE_ZONES.length)];
        return {
            x: width * (zone.xMin + Math.random() * (zone.xMax - zone.xMin)),
            y: height * (zone.yMin + Math.random() * (zone.yMax - zone.yMin))
        };
    };

    useEffect(() => {
        const handleNewTx = (payload: any) => {
            if (!containerRef.current) return;

            const tx = payload.new;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            // Explicitly check for SUCCESS status for green dots
            const isAllowed = tx.status === "SUCCESS";
            const loc = getRandomLocation(width, height);

            const newPoint: ThreatPoint = {
                id: tx.id,
                x: loc.x,
                y: loc.y,
                type: isAllowed ? "allowed" : "blocked",
            };

            setThreats((prev) => [...prev.slice(-15), newPoint]);
        };

        // Fetch recent to populate
        const fetchRecent = async () => {
            if (!containerRef.current) return;
            const { data } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (data) {
                const width = containerRef.current.clientWidth;
                const height = containerRef.current.clientHeight;
                const points = data.map(tx => {
                    const loc = getRandomLocation(width, height);
                    return {
                        id: tx.id,
                        x: loc.x,
                        y: loc.y,
                        type: tx.status === "SUCCESS" ? "allowed" : "blocked" as "blocked" | "allowed",
                    };
                });
                setThreats(points);
            }
        };

        fetchRecent();

        const channel = supabase
            .channel('map-updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, handleNewTx)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-full min-h-[400px] bg-[#020617] rounded-xl overflow-hidden border border-white/5 shadow-2xl">
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* World Map Silhouette */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-center bg-contain filter invert grayscale" />

            {/* Radar Sweep */}
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(59,130,246,0.05)_360deg)] animate-[spin_10s_linear_infinite] rounded-full scale-150 opacity-20 pointer-events-none" />

            {/* Threat Points */}
            <AnimatePresence>
                {threats.map((t) => (
                    <motion.div
                        key={t.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
                        exit={{ opacity: 0, scale: 2 }}
                        transition={{ duration: 1.5 }}
                        style={{ left: t.x, top: t.y }}
                        className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full flex items-center justify-center`}
                    >
                        <div className={`w-full h-full rounded-full animate-ping absolute opacity-40 ${t.type === "blocked" ? "bg-red-500" : "bg-emerald-500"}`} />
                        <div className={`w-2 h-2 rounded-full relative z-10 ${t.type === "blocked" ? "bg-red-500 shadow-[0_0_15px_red]" : "bg-emerald-500 shadow-[0_0_15px_emerald]"}`} />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Overlay Text */}
            <div className="absolute top-6 left-6 z-20">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase">Global Traffic Monitor</span>
                    </div>
                    <div className="text-[8px] text-zinc-500 font-mono uppercase">Real-time Network Analysis Active</div>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 left-6 z-20 flex gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-[8px] font-bold text-zinc-400 uppercase">Authorized</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-[8px] font-bold text-zinc-400 uppercase">Blocked / Threat</span>
                </div>
            </div>
        </div>
    );
}
