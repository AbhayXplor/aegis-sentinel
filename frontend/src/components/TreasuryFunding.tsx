import { useState } from "react";
import { Wallet, ArrowRight, Loader2, ChevronDown } from "lucide-react";
import { depositToVault } from "@/lib/blockchain";

import { MOCK_TOKEN_ADDRESS, REAL_TOKEN_ADDRESS, SUPPORTED_TOKENS } from "@/lib/constants";

export function TreasuryFunding({ isRealMode }: { isRealMode?: boolean }) {
    const [amount, setAmount] = useState("");
    const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
    const [isLoading, setIsLoading] = useState(false);

    const handleDeposit = async () => {
        if (!amount || isNaN(Number(amount))) return;

        setIsLoading(true);
        const AEGIS_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;

        // Use selected token address
        const TOKEN_ADDRESS = selectedToken.address;

        if (AEGIS_ADDRESS && TOKEN_ADDRESS) {
            // Pass decimals to depositToVault
            const success = await depositToVault(AEGIS_ADDRESS, TOKEN_ADDRESS, amount, selectedToken.decimals, isRealMode);
            if (success) {
                alert("Deposit successful!");
                setAmount("");
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Wallet className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Treasury Funding</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Deposit tokens to Aegis Vault</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                        Asset & Amount
                    </label>
                    <div className="flex gap-2">
                        <div className="relative w-28">
                            <select
                                value={selectedToken.symbol}
                                onChange={(e) => {
                                    const token = SUPPORTED_TOKENS.find(t => t.symbol === e.target.value);
                                    if (token) setSelectedToken(token);
                                }}
                                className="w-full h-full appearance-none bg-black/20 border border-white/10 rounded-lg pl-3 pr-8 text-sm text-white font-bold focus:outline-none focus:border-purple-500/50 cursor-pointer"
                            >
                                {SUPPORTED_TOKENS.map(token => (
                                    <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g. 5000"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all font-mono"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleDeposit}
                    disabled={isLoading || !amount}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                        </>
                    ) : (
                        <>
                            Deposit {selectedToken.symbol} <ArrowRight className="w-3 h-3" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
