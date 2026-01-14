# 🛡️ Aegis Sentinel Frontend

This is the web interface for **Aegis Sentinel**, the AI-powered security layer for smart wallets.

## 🌟 Features

- **Interactive Dashboard:** Real-time treasury overview and asset allocation.
- **Natural Language Policy Creation:** Create complex security rules using AI.
- **Payroll Automator:** An autonomous agent that manages recurring payments within your set guardrails.
- **Live Audit Feed:** Real-time monitoring of all wallet activity with policy status.
- **Simulation Mode:** Test your security policies against simulated "rogue agent" attacks.

## 🛠️ Development

### Environment Variables

Create a `.env.local` file in this directory with the following:

```env
# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Blockchain
NEXT_PUBLIC_AEGIS_GUARD_ADDRESS=0x...
NEXT_PUBLIC_REAL_TOKEN_ADDRESS=0x...
ROGUE_AGENT_PRIVATE_KEY=0x...
```

### Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎨 Design System

Aegis Sentinel uses a custom "Cyber-Premium" design system:
- **Colors:** Deep Slate (#0B1121), Cyber Cyan, Emerald Green, and Neon Rose.
- **Typography:** Inter & JetBrains Mono for a technical, high-end feel.
- **Animations:** Smooth transitions powered by Framer Motion.
