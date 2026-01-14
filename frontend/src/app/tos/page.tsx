"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function TOSPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            <Navbar />
            <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <div className="prose prose-invert max-w-none space-y-6 text-slate-400">
                    <p>Last updated: January 12, 2026</p>
                    <p>
                        Welcome to Aegis CFO. By using this application, you agree to the following terms.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8">1. Hackathon Project</h2>
                    <p>
                        Aegis CFO is an experimental prototype created for the Future of Finance. It is provided "as is" without any warranties of any kind.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8">2. Financial Risk</h2>
                    <p>
                        Using "Real Mode" involves interacting with real blockchain networks and assets. You are solely responsible for any financial losses incurred while using this software. We strongly recommend using "Demo Mode" for evaluation.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8">3. No Professional Advice</h2>
                    <p>
                        The AI-generated insights and risk analyses provided by Aegis CFO are for informational purposes only and do not constitute financial or legal advice.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8">4. Open Source</h2>
                    <p>
                        The code for this project is open-source and available on GitHub. Your use of the code is subject to the MIT License.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8">5. Limitation of Liability</h2>
                    <p>
                        In no event shall the creators of Aegis CFO be liable for any damages arising out of the use or inability to use the application.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
