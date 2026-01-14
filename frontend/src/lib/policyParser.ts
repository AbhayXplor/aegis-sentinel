import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!API_KEY) {
  console.warn("NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables.");
}
const genAI = new GoogleGenerativeAI(API_KEY || "");

export interface PolicyIntent {
  type: "FUNCTION" | "RECIPIENT" | "SPENDING_LIMIT";
  target: string;
  selector?: string;
  amount?: string;
  period?: number;
  description: string;
  riskScore: number;
}

export async function parsePolicyIntent(userInput: string): Promise<PolicyIntent> {
  try {
    // Use gemini-2.5-flash-lite as explicitly requested
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      You are an AI Policy Engine for a smart wallet.
      Your job is to translate Natural Language security rules into Solidity parameters.
      
      KNOWN PROTOCOLS:
      - Uniswap V2 Router: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
      - OpenAI API Billing: 0x4242424242424242424242424242424242424242
      - Anthropic Credits: 0x5555555555555555555555555555555555555555
      - AWS Infrastructure: 0x6666666666666666666666666666666666666666
      - Deel Payroll: 0x7777777777777777777777777777777777777777
      - Generic Stablecoin: 0x469470675401b92f1D7f1e83B4660FE51026746e
      
      KNOWN SELECTORS:
      - swap(uint256): 0x2e1a7d4d
      - transfer(address,uint256): 0xa9059cbb
      - approve(address,uint256): 0x095ea7b3
      
      USER INPUT: "${userInput}"
      
      INSTRUCTIONS:
      1. Determine if the user wants to allow a specific FUNCTION, whitelist a RECIPIENT, or set a SPENDING_LIMIT.
      2. If whitelisting a recipient (e.g., "Allow payments to OpenAI"), set type to "RECIPIENT" and target to the recipient address.
      3. If allowing a function (e.g., "Allow Uniswap swaps"), set type to "FUNCTION", target to the contract address, and selector to the 4-byte hex.
      4. If setting a spending limit (e.g., "Limit spending to 100 USDC per week"), set type to "SPENDING_LIMIT".
      5. Assign a Risk Score (0-100).
      
      Return ONLY a JSON object.
      Example Output (Recipient):
      {
        "type": "RECIPIENT",
        "target": "0x4242...",
        "description": "Whitelist OpenAI for automated payments",
        "riskScore": 5
      }
      Example Output (Spending Limit):
      {
        "type": "SPENDING_LIMIT",
        "target": "0x4694...",
        "amount": "100",
        "period": 604800,
        "description": "Limit spending to 100 tokens per week",
        "riskScore": 20
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Policy Parse Error:", error);
    return {
      type: "FUNCTION",
      target: "0x0000000000000000000000000000000000000000",
      selector: "0x00000000",
      description: "Failed to parse intent. Please try again.",
      riskScore: 0
    };
  }
}
