"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck, ShieldAlert, Loader2, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { ethers } from "ethers";
import { REAL_TOKEN_ADDRESS, TOKEN_ABI } from "@/lib/constants";
import { validateTransaction } from "@/lib/policyEngine";
import { TokenLogo } from "./TokenLogo";

interface Entity {
    id: string;
    name: string;
    wallet: string;
    limit: string;
}

interface BatchPaymentModalProps {
    selectedEntities: Entity[];
    onClose: () => void;
    onSuccess: () => void;
}

export function BatchPaymentModal({ selectedEntities, onClose, onSuccess }: BatchPaymentModalProps) {
    const [step, setStep] = useState<'review' | 'audit' | 'processing' | 'complete'>('review');
    const [auditResults, setAuditResults] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });
    const [currentTxIndex, setCurrentTxIndex] = useState(0);
    const [txHashes, setTxHashes] = useState<string[]>([]);

    const totalAmount = selectedEntities.reduce((acc, e) => acc + parseFloat(e.limit.replace(/,/g, '')), 0);

    const runAiAudit = async () => {
        setStep('audit');

        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 2000));

        const errors: string[] = [];
        selectedEntities.forEach(entity => {
            const amount = parseFloat(entity.limit.replace(/,/g, ''));
            const result = validateTransaction(amount, entity.wallet);
            if (!result.valid) {
                result.errors.forEach(err => errors.push(`${entity.name}: ${err}`));
            }
        });

        setAuditResults({
            valid: errors.length === 0,
            errors
        });
    };

    const executeBatch = async () => {
        if (!auditResults.valid) return;
        setStep('processing');

        try {
            if (!window.ethereum) throw new Error("No wallet found");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(REAL_TOKEN_ADDRESS, TOKEN_ABI, signer);

            const newHashes: string[] = [];

            for (let i = 0; i < selectedEntities.length; i++) {
                setCurrentTxIndex(i);
                const entity = selectedEntities[i];
                const amountWei = ethers.parseUnits(entity.limit.replace(/,/g, ''), 18);

                const tx = await contract.transfer(entity.wallet, amountWei);
                await tx.wait();
                newHashes.push(tx.hash);
            }

            setTxHashes(newHashes);
            setStep('complete');
        } catch (error) {
            console.error("Batch failed:", error);
            alert("Batch execution failed. Check console.");
            setStep('review'); // Allow retry
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Zap className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Batch Payroll</h3>
                            <p className="text-[10px] text-slate-500 font-medium">AI-Audited Disbursement</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {step === 'review' && (
                        <div className="space-y-6">
                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-lg font-bold text-white">{totalAmount.toLocaleString()}</span>
                                        <span className="text-xs font-bold text-blue-400">Tokens</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recipients</span>
                                    <span className="text-sm font-bold text-white">{selectedEntities.length}</span>
                                </div>
                            </div>

                            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {selectedEntities.map(e => (
                                    <div key={e.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div>
                                            <div className="text-sm font-bold text-white">{e.name}</div>
                                            <div className="text-[10px] text-slate-500 font-mono">{e.wallet}</div>
                                        </div>
                                        <div className="text-sm font-bold text-emerald-400">{e.limit}</div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={runAiAudit}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Run AI Audit
                            </button>
                        </div>
                    )}

                    {step === 'audit' && (
                        <div className="py-10 text-center space-y-4">
                            {!auditResults.errors.length && auditResults.valid ? (
                                <>
                                    <div className="relative w-16 h-16 mx-auto">
                                        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-ping"></div>
                                        <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Zap className="w-6 h-6 text-blue-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">AI Agent Auditing...</h3>
                                    <p className="text-sm text-slate-400">Checking policies and risk factors</p>
                                </>
                            ) : (
                                <div className="space-y-6">
                                    {auditResults.valid ? (
                                        <>
                                            <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Audit Passed</h3>
                                                <p className="text-sm text-slate-400">All checks passed. Ready to execute.</p>
                                            </div>
                                            <button
                                                onClick={executeBatch}
                                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                                            >
                                                Execute Payments
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                                                <ShieldAlert className="w-8 h-8 text-red-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Policy Violations Found</h3>
                                                <div className="mt-4 text-left bg-red-500/5 border border-red-500/10 rounded-lg p-4 space-y-2">
                                                    {auditResults.errors.map((err, i) => (
                                                        <div key={i} className="flex items-start gap-2 text-xs text-red-400">
                                                            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                                            {err}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={onClose}
                                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-all"
                                            >
                                                Close & Fix
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="py-10 text-center space-y-4">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                            <h3 className="text-lg font-bold text-white">Processing Batch...</h3>
                            <p className="text-sm text-slate-400">
                                Transaction {currentTxIndex + 1} of {selectedEntities.length}
                            </p>
                        </div>
                    )}

                    {step === 'complete' && (
                        <div className="py-10 text-center space-y-6">
                            <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Batch Complete!</h3>
                                <p className="text-sm text-slate-400">{selectedEntities.length} payments sent successfully.</p>
                            </div>
                            <button
                                onClick={onSuccess}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
