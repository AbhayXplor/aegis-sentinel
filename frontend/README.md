# Aegis CFO: Autonomous Crypto Treasury

![Aegis Dashboard](C:/Users/abhay/.gemini/antigravity/brain/17897b01-6036-4695-8d56-accd78d3609a/uploaded_image_1768128324754.png)

**Aegis CFO** is an AI-native financial controller for on-chain organizations. It automates payroll, enforces spending policies, and detects security threats in real-time using a dedicated autonomous agent.

Built for the **MNEE Hackathon**, Aegis combines the security of smart contract vaults with the intelligence of Gemini 2.5 Flash Lite.

## 🚀 Key Features

### 🤖 Autonomous Payroll Agent
- **Auto-Pilot Mode**: Automatically scans for due payments and executes them.
- **Natural Language Policies**: "Allow Payroll to send 5000 MNEE per month."
- **Safety Caps**: Set maximum transaction limits to prevent runaway spending.

### 🛡️ Security Center
- **Global Threat Map**: Real-time visualization of blocked transaction attempts.
- **Shadow Spend Detector**: AI analysis of transaction history to identify unlabelled recurring costs.
- **Live Audit Log**: Immutable record of every policy enforcement action.

### 💰 Treasury Management
- **Runway Forecaster**: Live calculation of financial runway based on burn rate.
- **Multi-Asset Vault**: Secure storage for ETH and MNEE tokens.
- **Instant Funding**: Seamless deposit flow from connected wallets.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion
- **Blockchain**: Ethers.js, Solidity (AegisGuard Contract)
- **AI**: Google Gemini 2.5 Flash Lite (via Vercel AI SDK)
- **Database**: Supabase (for entity management)

## 📦 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aegis-cfo.git
   cd aegis-cfo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   NEXT_PUBLIC_AEGIS_GUARD_ADDRESS=your_contract_address
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🚢 Deployment

Aegis is optimized for deployment on **Vercel**.

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add your environment variables.
4. Click **Deploy**.

---

*Built with ❤️ by the Aegis Team.*
