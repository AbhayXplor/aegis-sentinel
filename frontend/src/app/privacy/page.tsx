"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose prose-invert max-w-none space-y-6 text-slate-400">
                    <p>Last updated: January 12, 2026</p>
                    <p>
                        Aegis CFO is a project built for the Future of Finance. This Privacy Policy describes how we handle information when you use our application.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8">1. Information Collection</h2>
                    <p>
                        We do not collect any personal identification information (PII). The application interacts with your crypto wallet (e.g., MetaMask) to display balances and execute transactions. We do not store your private keys or seed phrases.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8">2. Data Storage</h2>
                    <p>
                        Some application data (such as entity names and transaction logs) may be stored in a Supabase database for the purpose of the demo. This data is public within the context of the hackathon project.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8">3. Cookies</h2>
                    <p>
                        We may use local storage to save your application preferences (such as Demo Mode vs. Real Mode) and session state.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8">4. Third-Party Services</h2>
                    <p>
                        We use Google Gemini AI for policy parsing and risk analysis. Data sent to Gemini is limited to the text of the policies you define.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8">5. Contact</h2>
                    <p>
                        As this is a hackathon project, there is no official support. Please refer to the GitHub repository for any inquiries.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
