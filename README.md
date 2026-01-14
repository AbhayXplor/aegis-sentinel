# 🛡️ Aegis Sentinel

**AI-Powered On-Chain Security & Autonomous Guardrails for Smart Wallets.**

Aegis Sentinel is a next-generation security layer for decentralized finance. It combines the power of Large Language Models (LLMs) with on-chain policy enforcement to provide a "Guardian" for your smart wallet. Whether you are an individual user or a DAO treasury, Aegis Sentinel ensures that your funds are protected by intelligent, real-time guardrails.

![Aegis Sentinel Dashboard](file:///c:/Users/abhay/Downloads/MNEE%20Hackathon/aegis/frontend/public/dashboard_preview.png)

## 🚀 Key Features

- **🧠 AI Policy Engine:** Define complex security rules in plain English (e.g., *"Allow payments to OpenAI up to 500 tokens per month"*). Aegis translates these into deterministic on-chain policies.
- **🛡️ Autonomous Guardrails:** Real-time enforcement of spending limits, whitelists, and function-level permissions directly on the blockchain.
- **🤖 Autonomous Agents:** Securely delegate transaction authority to AI agents (like the Payroll Automator) while maintaining strict control via the Aegis Guard.
- **📋 Live Audit Logs:** A transparent, real-time feed of all transaction attempts, including detailed policy status and risk analysis.
- **⚡ Real-time Risk Assessment:** Instant detection of suspicious patterns, phishing attempts, and unauthorized spend.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion, Lucide Icons.
- **Blockchain:** Solidity, Ethers.js, Hardhat.
- **AI/ML:** Google Gemini 1.5 Flash (via Gemini SDK).
- **Backend/Database:** Supabase (Realtime, Postgres).

## 📂 Project Structure

- `/aegis/contracts`: Solidity smart contracts and deployment scripts.
- `/aegis/frontend`: Next.js web application.
- `/aegis/frontend/src/lib`: Core logic for AI integration, blockchain interaction, and Supabase.

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- MetaMask or any EIP-1193 wallet.
- Gemini API Key.
- Supabase Project.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/aegis-sentinel.git
   cd aegis-sentinel
   ```

2. **Setup Frontend:**
   ```bash
   cd aegis/frontend
   npm install
   cp .env.example .env.local
   # Fill in your NEXT_PUBLIC_GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, etc.
   npm run dev
   ```

3. **Setup Contracts (Optional):**
   ```bash
   cd aegis/contracts
   npm install
   npx hardhat compile
   ```

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
