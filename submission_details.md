# Aegis CFO: Hackathon Submission Details

Here are the answers for your submission form based on the project we've built.

---

### � Track Selection
**Track 3: Financial Automation** (Primary)
*Reasoning: Aegis CFO is a comprehensive Treasury Management system, which is explicitly listed in this track. It also qualifies for Track 1 (AI & Agent Payments) due to its autonomous payroll agent.*

---

### �🏷️ Project Name (Max 60 chars)
**Aegis CFO: The Autonomous AI Treasury Manager**

---

### 🚀 Elevator Pitch (Max 200 chars)
**Aegis CFO is an AI-native financial operating system that automates payroll, enforces on-chain spending policies, and proactively blocks treasury threats using intelligent guardrails.**

---

### 📝 What it does
Aegis CFO acts as an intelligent layer on top of your crypto treasury. It moves beyond simple multisigs by providing:
*   **Autonomous Payroll**: Set up recurring payment streams (Daily, Weekly, Monthly) with automated execution.
*   **AI Policy Engine**: Define complex spending rules in plain English (e.g., "Limit weekly spend to 5000 MNEE") which are enforced on-chain.
*   **Threat Neutralization**: Proactively monitors for rogue agent behavior or compromised keys and blocks unauthorized drains before they hit the mempool.
*   **Financial Intelligence**: Provides real-time runway forecasting, asset tracking, and shadow spend detection.

---

### 🛠️ How we built it
*   **Frontend**: Built with **Next.js 14** and **Tailwind CSS** for a premium, institutional-grade dashboard. We used **Framer Motion** for smooth, high-fidelity animations.
*   **Blockchain**: Developed custom **Solidity** smart contracts (**AegisGuard**) to hold treasury funds and enforce AI-parsed rules. Integrated with **Ethers.js** for live Mainnet and Sepolia interactions.
*   **AI**: Leveraged **Google Gemini 2.0 Flash** to parse natural language policies into structured data and perform real-time risk analysis on transaction history.
*   **Backend**: Used **Supabase** for real-time audit logs, entity management, and financial analytics.

---

### 🚧 Challenges we ran into
*   **Bridging AI and On-Chain Logic**: Translating ambiguous natural language into strict, deterministic smart contract guardrails required careful prompt engineering and validation layers.
*   **Real-Time Security**: Implementing a system that can detect and block "rogue" transactions in real-time while maintaining a smooth user experience.
*   **Data Integrity**: Ensuring that treasury valuations and runway forecasts remained accurate across multiple networks (Mainnet/Sepolia) with live price feeds.

---

### 🏆 Accomplishments that we're proud of
*   Successfully building a **fully functional end-to-end prototype** that works on both Sepolia (for demo) and Ethereum Mainnet (for production).
*   Creating a **premium UI/UX** that feels like a professional fintech product, making complex treasury management accessible to any founder.
*   Implementing a **Shadow Spend Detector** that uses AI to find hidden recurring costs in transaction history.

---

### 📖 What we learned
*   The power of combining **AI agents with smart contract allowances** to create "safe autonomy."
*   How to build a **dual-mode architecture** that allows users to test complex financial flows in a risk-free simulation before going live.

---

### 🔌 Third-Party APIs / SDKs
*   **Google Gemini 2.0 Flash**: Used for the AI Policy Engine and real-time risk auditing.
*   **Supabase**: Used for persistent audit logs, entity management, and financial data storage.
*   **Ethers.js**: Used for all blockchain interactions and smart contract execution.
*   **Next.js**: The core application framework.
*   **Framer Motion**: Used for premium UI animations and transitions.
*   **Recharts**: Used for treasury and asset allocation visualizations.
*   **Lucide React**: Used for the iconography system.

---

### 🔮 What's next for Aegis CFO
*   **Multi-Agent Collaboration**: Allowing different AI agents to manage specific sub-budgets (e.g., a Marketing Agent vs. an Engineering Agent).
*   **Advanced Yield Optimization**: Automatically moving idle treasury funds into safe yield-bearing protocols based on upcoming payroll obligations.
*   **L2 Expansion**: Deploying AegisGuard to Base and Arbitrum to reduce operational costs for smaller DAOs.
