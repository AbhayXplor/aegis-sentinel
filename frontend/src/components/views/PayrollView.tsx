import { SimulationControl } from "../SimulationControl";
import { PageHeader } from "../PageHeader";
import { Users, Banknote, History, ArrowUpRight } from "lucide-react";
import { MneeLogo } from "../MneeLogo";

interface PayrollViewProps {
    isRealMode: boolean;
    isPaused: boolean;
}

export function PayrollView({ isRealMode, isPaused }: PayrollViewProps) {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Payroll & Treasury"
                subtitle="Manage automated disbursements, employee payroll, and treasury operations."
            />

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Payroll Simulator (5 cols) */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Banknote className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payroll Simulator</h3>
                                <p className="text-[10px] text-slate-500 font-medium">Test automated disbursement logic</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <SimulationControl isRealMode={isRealMode} isPaused={isPaused} />
                        </div>
                    </div>

                    {/* Quick Stats Card */}
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
                </div>

                {/* Right Column: Employee Directory (7 cols) */}
                <div className="col-span-12 lg:col-span-7">
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col h-full">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <Users className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Employee Directory</h3>
                                    <p className="text-[10px] text-slate-500 font-medium">Whitelisted payroll recipients</p>
                                </div>
                            </div>
                            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest transition-all">
                                Add Employee
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {[
                                    { name: "Alex Rivera", role: "Smart Contract Engineer", wallet: "0x71C...4a2b", limit: "15,000" },
                                    { name: "Jordan Lee", role: "Security Auditor", wallet: "0x3a2...9f1e", limit: "12,000" },
                                    { name: "Casey Smith", role: "DevOps Lead", wallet: "0x9b5...2c8d", limit: "10,000" },
                                    { name: "Taylor Doe", role: "Frontend Architect", wallet: "0x1d4...6e7f", limit: "11,000" }
                                ].map((emp, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                                                {emp.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{emp.name}</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{emp.role}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-mono text-slate-400 mb-1">{emp.wallet}</p>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Limit:</span>
                                                <span className="text-[10px] font-bold text-emerald-400">${emp.limit}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
