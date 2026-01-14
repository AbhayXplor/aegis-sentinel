# ♊ Gemini AI Setup for Aegis Sentinel

Aegis Sentinel uses Google Gemini 1.5 Flash to power its Natural Language Policy Engine and Transaction Risk Analysis.

## 🔑 Getting an API Key

1. Go to the [Google AI Studio](https://aistudio.google.com/).
2. Create a new API Key.
3. Copy the key.

## ⚙️ Configuration

1. Open `aegis/frontend/.env.local`.
2. Add your key to the `NEXT_PUBLIC_GEMINI_API_KEY` variable:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_key_here
```

## 🧠 How Aegis Sentinel uses Gemini

### 1. Policy Intent Analysis
When a user enters a rule like *"Block all transfers to 0x123..."*, Gemini identifies:
- **Action:** Block
- **Target:** 0x123...
- **Risk Level:** High

### 2. Policy Generation
Gemini generates human-readable descriptions and risk scores for every security rule created, ensuring transparency for the user.

### 3. Risk Auditing (Optional)
Gemini can analyze transaction data (target, function, value) to provide a real-time risk score and explanation before execution.
