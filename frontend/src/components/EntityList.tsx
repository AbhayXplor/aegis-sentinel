"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Plus, Loader2, Trash2 } from "lucide-react";
import { BatchPaymentModal } from "./BatchPaymentModal";

interface Entity {
    id: string;
    name: string;
    role: string; // Mapped from 'type' for display
    wallet: string;
    limit: string; // Mapped from 'monthly_allowance'
    type: 'employee' | 'vendor';
}

const MOCK_EMPLOYEES: Entity[] = [
    { id: "1", name: "Alex Rivera", role: "Smart Contract Engineer", wallet: "0x71C...4a2b", limit: "15,000", type: 'employee' },
    { id: "2", name: "Jordan Lee", role: "Security Auditor", wallet: "0x3a2...9f1e", limit: "12,000", type: 'employee' },
    { id: "3", name: "Casey Smith", role: "DevOps Lead", wallet: "0x9b5...2c8d", limit: "10,000", type: 'employee' },
    { id: "4", name: "Taylor Doe", role: "Frontend Architect", wallet: "0x1d4...6e7f", limit: "11,000", type: 'employee' }
];

interface EntityListProps {
    isRealMode: boolean;
}

export function EntityList({ isRealMode }: EntityListProps) {
    const [entities, setEntities] = useState<Entity[]>(MOCK_EMPLOYEES);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // New Entity Form State
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState<'employee' | 'vendor'>('employee');
    const [newWallet, setNewWallet] = useState("");
    const [newAllowance, setNewAllowance] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Batch Payment State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBatchModal, setShowBatchModal] = useState(false);

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleBatchSuccess = () => {
        setShowBatchModal(false);
        setSelectedIds(new Set());
        alert("Batch payments completed successfully!");
    };

    useEffect(() => {
        if (isRealMode) {
            fetchEntities();
        } else {
            setEntities(MOCK_EMPLOYEES);
        }
    }, [isRealMode]);

    const fetchEntities = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('entities')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching entities:", error);
        } else if (data) {
            setEntities(data.map(e => ({
                id: e.id,
                name: e.name,
                role: e.type === 'employee' ? 'Employee' : 'Vendor',
                wallet: e.wallet_address,
                limit: e.monthly_allowance,
                type: e.type
            })));
        }
        setIsLoading(false);
    };

    const handleAddEntity = async () => {
        if (!newName || !newWallet || !newAllowance) return;

        setIsSaving(true);
        const { error } = await supabase.from('entities').insert([{
            name: newName,
            type: newType,
            wallet_address: newWallet,
            monthly_allowance: newAllowance,
            status: 'active'
        }]);

        if (error) {
            alert("Failed to add entity: " + error.message);
        } else {
            setShowAddModal(false);
            setNewName("");
            setNewWallet("");
            setNewAllowance("");
            fetchEntities();
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this entity?")) return;

        const { error } = await supabase.from('entities').delete().eq('id', id);
        if (error) {
            alert("Failed to delete: " + error.message);
        } else {
            fetchEntities();
        }
    };

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col h-full">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Entity Directory</h3>
                        <p className="text-[10px] text-slate-500 font-medium">
                            {isRealMode ? "Manage Real Employees & Vendors" : "Simulated Employee List"}
                        </p>
                    </div>
                </div>
                {isRealMode && (
                    <div className="flex gap-2">
                        {selectedIds.size > 0 && (
                            <button
                                onClick={() => setShowBatchModal(true)}
                                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-[10px] font-bold text-blue-400 uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                Pay Selected ({selectedIds.size})
                            </button>
                        )}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-400 uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                            <Plus className="w-3 h-3" /> Add Entity
                        </button>
                    </div>
                )}
            </div>

            <div className="p-6 flex-1 overflow-y-auto max-h-[500px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
                    </div>
                ) : entities.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                        No entities found. Add one to get started.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {entities.map((emp) => (
                            <div key={emp.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${selectedIds.has(emp.id) ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                <div className="flex items-center gap-4">
                                    {isRealMode && (
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(emp.id)}
                                            onChange={() => toggleSelection(emp.id)}
                                            className="w-4 h-4 rounded border-white/20 bg-black/40 text-blue-500 focus:ring-offset-0 focus:ring-0"
                                        />
                                    )}
                                    <div className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-xs font-bold text-white ${emp.type === 'vendor' ? 'bg-purple-500/20' : 'bg-gradient-to-br from-blue-500/20 to-emerald-500/20'}`}>
                                        {emp.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{emp.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{emp.role}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div>
                                        <p className="text-[10px] font-mono text-slate-400 mb-1">
                                            {emp.wallet.substring(0, 6)}...{emp.wallet.substring(emp.wallet.length - 4)}
                                        </p>
                                        <div className="flex items-center gap-2 justify-end">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Limit:</span>
                                            <span className="text-[10px] font-bold text-emerald-400">${emp.limit}</span>
                                        </div>
                                    </div>
                                    {isRealMode && (
                                        <button
                                            onClick={() => handleDelete(emp.id)}
                                            className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Entity Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-6">Add New Entity</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Name</label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm"
                                    value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. John Doe or AWS"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Type</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm"
                                    value={newType} onChange={e => setNewType(e.target.value as any)}
                                >
                                    <option value="employee">Employee</option>
                                    <option value="vendor">Vendor</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Wallet Address</label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm font-mono"
                                    value={newWallet} onChange={e => setNewWallet(e.target.value)} placeholder="0x..."
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Monthly Allowance (Tokens)</label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm"
                                    value={newAllowance} onChange={e => setNewAllowance(e.target.value)} placeholder="5000"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddEntity}
                                disabled={isSaving}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-bold flex items-center gap-2"
                            >
                                {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                                Save Entity
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Batch Payment Modal */}
            {showBatchModal && (
                <BatchPaymentModal
                    selectedEntities={entities.filter(e => selectedIds.has(e.id))}
                    onClose={() => setShowBatchModal(false)}
                    onSuccess={handleBatchSuccess}
                />
            )}
        </div>
    );
}
