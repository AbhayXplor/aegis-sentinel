import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with the provided key
// In production, this should be in .env.local, but for the hackathon demo we use the provided key directly
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!API_KEY) {
  console.warn("NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export async function generatePolicyFromPrompt(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const systemPrompt = `
      You are an AI security assistant for a smart wallet.
      Your goal is to translate natural language user intents into specific smart contract policy parameters.
      
      The user will say something like: "Allow my agent to swap up to 50 tokens on Uniswap"
      
      You need to extract:
      1. Target Contract Name (e.g., Uniswap, Aave) - infer a dummy 0x address if needed.
      2. Function Signature (e.g., swap(uint256), transfer(address,uint256)).
      3. Spending Limit (number).
      
      Return ONLY a JSON object. Do not include markdown formatting.
      Example Output:
      {
        "target": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "selector": "swap(uint256)",
        "limit": "50"
      }
      
      Known Addresses:
      - Uniswap: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
      - Aave: 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9
      - Stablecoin: 0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
    `;

    const result = await model.generateContent(systemPrompt + "\nUser Input: " + prompt);
    const response = result.response;
    const text = response.text();

    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error generating policy:", error);
    return null;
  }
}
