# Aegis Prime: Autonomous Security Protocol

**Aegis Prime** is an AI-powered security firewall for blockchain transactions. It acts as a "Smart Vault" that intercepts transactions, analyzes them with Gemini AI for risk, and enforces granular policies (e.g., "Allow payments to OpenAI", "Block transfers > 1000 MNEE").

![Aegis Prime Dashboard](https://i.imgur.com/placeholder.png) 
*(Replace with your actual screenshot)*

## 🚀 Features

*   **AI Policy Engine**: Natural language policies ("Allow AWS payments") parsed by Gemini 2.5 Flash.
*   **Smart Vault**: A Solidity smart contract (`AegisGuard`) that holds funds and enforces rules on-chain.
*   **Real-time Threat Map**: Visualizes blocked threats and authorized operations globally.
*   **Rogue Agent Simulation**: Built-in demo mode to simulate attacks and valid traffic.
*   **MNEE Token Integration**: Full support for ERC-20 token transfers and spending limits.

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Lucide React.
*   **Blockchain**: Hardhat, Ethers.js, Solidity (Sepolia Testnet).
*   **AI**: Google Gemini API.
*   **Backend**: Supabase (Real-time logs & analytics).

## 📦 Project Structure

*   `frontend/`: The Next.js dashboard and API routes.
*   `contracts/`: The Solidity smart contracts and deployment scripts.

## ⚡ Quick Start

### Prerequisites
*   Node.js 18+
*   MetaMask Wallet (Sepolia Network)
*   Gemini API Key
*   Supabase Project

### 1. Clone & Install
```bash
git clone https://github.com/your-username/aegis-prime.git
cd aegis-prime

# Install Frontend Dependencies
cd frontend
npm install

# Install Contract Dependencies
cd ../contracts
npm install
```

### 2. Environment Setup
Create a `.env.local` file in `frontend/`:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_MNEE_ADDRESS=0x...
NEXT_PUBLIC_AEGIS_GUARD_ADDRESS=0x...
```

### 3. Run Locally
```bash
cd frontend
npm run dev
```
Visit `http://localhost:3000`.

## 🛡️ Smart Contracts

The `AegisGuard` contract is deployed on Sepolia.
*   **AegisGuard**: `0xC534d9923eA8fFE1A1e117352c1dE6c61F31e095`
*   **MockMNEE**: `0x469470675401b92f1D7f1e83B4660FE51026746e`

## 📄 License
MIT
