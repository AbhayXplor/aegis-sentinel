import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AuditResult {
    riskScore: number; // 0-100 (0 is safe, 100 is critical risk)
    status: "SAFE" | "WARNING" | "BLOCKED";
    reason: string;
    analysis: string;
}

export async function auditTransaction(target: string, selector: string, amount: string): Promise<AuditResult> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
      You are an AI Security Auditor for a smart wallet.
      An AI agent is attempting to execute a transaction.
      
      TRANSACTION DETAILS:
      - Target Contract: ${target}
      - Function: ${selector}
      - Amount: ${amount} MNEE
      
      Analyze this transaction for potential risks:
      1. Is the amount unusually high for a single transaction? (Assume 1000+ MNEE is high risk).
      2. Is the target contract a known protocol or a suspicious address?
      3. Does the function signature look like a standard DeFi operation or something dangerous (e.g., selfdestruct, transferOwnership)?
      
      Return ONLY a JSON object.
      Example Output:
      {
        "riskScore": 15,
        "status": "SAFE",
        "reason": "Standard transfer to known address.",
        "analysis": "The transaction uses a standard transfer function with a moderate amount. No malicious patterns detected."
      }
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        // Find the first { and last } to handle cases where Gemini adds extra text
        const start = cleanText.indexOf("{");
        const end = cleanText.lastIndexOf("}");
        if (start === -1 || end === -1) throw new Error("Invalid JSON response");

        const jsonStr = cleanText.substring(start, end + 1);
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Audit Error:", error);
        return {
            riskScore: 50,
            status: "WARNING",
            reason: "Auditor Timeout",
            analysis: "Could not complete AI audit. Proceed with caution."
        };
    }
}
