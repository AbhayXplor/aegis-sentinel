export function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-white/5 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold text-white mb-4">Aegis CFO</h3>
                        <p className="text-slate-400 max-w-sm">
                            The autonomous financial operating system for the next generation of on-chain organizations. Secure, intelligent, and always on.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><a href="/features" className="hover:text-blue-400">Features</a></li>
                            <li><a href="/pricing" className="hover:text-blue-400">Pricing</a></li>
                            <li><a href="/dashboard" className="hover:text-blue-400">Dashboard</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">© 2026 Aegis CFO. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        {/* Social icons would go here */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
