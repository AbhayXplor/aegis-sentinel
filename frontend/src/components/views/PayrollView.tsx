"use client";

import { Banknote, History, Users } from "lucide-react";
import { TreasuryFunding } from "../TreasuryFunding";
import { EntityList } from "../EntityList";
import { MneeLogo } from "../MneeLogo";
import { SimulationControl } from "../SimulationControl";
import { RealPaymentControl } from "../RealPaymentControl";
import { RealPayrollActivity } from "../RealPayrollActivity";
import { PayrollAgent } from "../PayrollAgent";

interface PayrollViewProps {
    isRealMode: boolean;
    isPaused: boolean;
    balance: string;
}

export function PayrollView({ isRealMode, isPaused, balance }: PayrollViewProps) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Payroll Simulator (5 cols) */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                    {/* New Treasury Funding Card */}
                    <TreasuryFunding isRealMode={isRealMode} />

                    {/* Auto-Pilot Agent (Both Modes) */}
                    <PayrollAgent isRealMode={isRealMode} />

                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Banknote className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                    {isRealMode ? "Make Payment" : "Payroll Simulator"}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-medium">
                                    {isRealMode ? "Send MNEE to vendors or employees" : "Test automated disbursement logic"}
                                </p>
                            </div>
                        </div>
                        <div className="p-6">
                            {isRealMode ? (
                                <RealPaymentControl />
                            ) : (
                                <SimulationControl isRealMode={isRealMode} isPaused={isPaused} />
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    {isRealMode ? (
                        <RealPayrollActivity />
                    ) : (
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <History className="w-3 h-3 text-slate-400" /> Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Monthly Payroll", amount: "42,500.00", status: "Scheduled" },
                                    { label: "Office Rent", amount: "8,200.00", status: "Pending" },
                                    { label: "AWS Infrastructure", amount: "12,450.00", status: "Authorized" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div>
                                            <p className="text-[11px] font-bold text-white">{item.label}</p>
                                            <p className="text-[9px] text-slate-500 uppercase tracking-widest">{item.status}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-bold text-white">${item.amount}</p>
                                            <div className="flex items-center justify-end gap-1">
                                                <span className="text-[9px] text-blue-400 uppercase tracking-widest">MNEE</span>
                                                <MneeLogo className="w-2 h-2" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Employee Directory (7 cols) */}
                <div className="col-span-12 lg:col-span-7">
                    <EntityList isRealMode={isRealMode} />
                </div>
            </div>
        </div>
    );
}
