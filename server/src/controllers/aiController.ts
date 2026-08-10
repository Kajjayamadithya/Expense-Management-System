import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * Helper to parse amounts from text with full support for Indian & global currency notations
 * e.g., "15 lakhs" -> 1500000, "1.5 lakh" -> 150000, "1 crore" -> 10000000, "50k" -> 50000, "₹1,500" -> 1500
 */
function parseAmountFromText(text: string): number | null {
  if (!text) return null;
  const clean = text.toLowerCase().replace(/,/g, "");

  // 1. Crore / Crores / Cr (1 Crore = 10,00,000)
  const croreMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)\b/i);
  if (croreMatch) {
    return Math.round(parseFloat(croreMatch[1]) * 10000000);
  }

  // 2. Lakh / Lakhs / Lac / Lacs / L (1 Lakh = 1,00,000)
  const lakhMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b/i);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  // 3. Thousand / K (1 Thousand = 1,000)
  const thousandMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k)\b/i);
  if (thousandMatch) {
    return Math.round(parseFloat(thousandMatch[1]) * 1000);
  }

  // 4. Standard numeric values (e.g. ₹1500000, $1500, 1500)
  const numberMatch = clean.match(/(?:₹|\$|rs\.?|rupees|usd)?\s*(\d+(?:\.\d+)?)/i);
  if (numberMatch) {
    return parseFloat(numberMatch[1]);
  }

  return null;
}

// Helper function to call Gemini REST API
async function callGeminiAPI(prompt: string, imageBase64?: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const model = imageBase64 ? "gemini-1.5-flash" : "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [{ text: prompt }];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
      }),
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
  }
  return null;
}

// 🤖 1. AI Chatbot (Multi-Persona)
export const chatWithAI = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, persona, summary } = req.body;

    let personaSystemPrompt = "";
    if (persona === "strict") {
      personaSystemPrompt = `You are a strict, no-nonsense financial budget coach. You tell the user brutally honest feedback about overspending and push them to cut unnecessary expenses. Keep responses punchy (2-3 sentences).`;
    } else if (persona === "wealth") {
      personaSystemPrompt = `You are a smart wealth and investment advisor. You recommend savings rules like 50/30/20, emergency funds, and disciplined investing based on the user's balance. Keep responses encouraging and structured.`;
    } else if (persona === "shopping") {
      personaSystemPrompt = `You are a Shopping Guard assistant. The user asks if they can afford a purchase. Evaluate their balance vs purchase price.
Note: Parse Indian currency terms accurately (e.g. 1 Lakh = 100,000 INR, 15 Lakhs = 1,500,000 INR, 1 Crore = 10,000,000 INR, 50k = 50,000 INR).
Give a clear verdict ("Safe Purchase", "Proceed with Caution", or "Risky / Overbudget") with reasoning.`;
    } else {
      personaSystemPrompt = `You are a helpful, friendly personal CFO and financial assistant.`;
    }

    const fullPrompt = `${personaSystemPrompt}\nUser balance summary: Income = ₹${summary?.income || 0}, Expense = ₹${summary?.expense || 0}, Net Balance = ₹${summary?.balance || 0}.\nUser Question: "${message}"`;

    const aiResponse = await callGeminiAPI(fullPrompt);

    if (aiResponse) {
      res.json({ reply: aiResponse });
      return;
    }

    // 💡 Fallback simulation response if GEMINI_API_KEY is not set
    let reply = "";
    const lowerMsg = message.toLowerCase();
    const balance = summary?.balance || 0;
    const formattedBalance = balance.toLocaleString("en-IN");

    if (persona === "strict") {
      if (balance <= 0) {
        reply = `⚠️ Red Alert! Your balance is ₹${formattedBalance}. Stop all non-essential spending immediately until you record fresh income!`;
      } else {
        reply = `Your current balance is ₹${formattedBalance}. Keep dining and entertainment expenses under 15% of your total budget! Every saved rupee builds your security.`;
      }
    } else if (persona === "shopping") {
      const parsedCost = parseAmountFromText(message);
      const cost = parsedCost !== null ? parsedCost : 500;
      const formattedCost = cost.toLocaleString("en-IN");

      if (cost > balance) {
        reply = `🚨 Verdict: **Risky / Overbudget**! This purchase (₹${formattedCost}) exceeds your available net balance (₹${formattedBalance}). Better to save up first!`;
      } else if (cost > balance * 0.4) {
        reply = `⚠️ Verdict: **Proceed with Caution**. This ₹${formattedCost} purchase takes over 40% of your remaining balance (₹${formattedBalance}). Ensure upcoming bills are covered!`;
      } else {
        reply = `✅ Verdict: **Safe Purchase**! At ₹${formattedCost}, your current balance of ₹${formattedBalance} can comfortably absorb this purchase.`;
      }
    } else if (persona === "wealth") {
      reply = `💡 Wealth Tip: With a net balance of ₹${formattedBalance}, aim to allocate 50% to essentials, 30% to wants, and 20% directly into an emergency savings fund or mutual funds!`;
    } else {
      if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
        reply = `Hello! 👋 I'm your AI Financial Copilot. How can I help you manage your funds today?`;
      } else {
        reply = `I analyzed your finances. You currently have an income of ₹${(summary?.income || 0).toLocaleString("en-IN")} and total expenses of ₹${(summary?.expense || 0).toLocaleString("en-IN")}. Net balance is ₹${formattedBalance}.`;
      }
    }

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: "AI Assistant processing error", error });
  }
};

// ⚡ 2. Natural Language Transaction Parser
export const parseNaturalLanguageTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    const systemPrompt = `You are a financial NLP parser. Extract transaction details from this text: "${prompt}".
Note: Parse Indian currency terms accurately (e.g. 1 Lakh = 100,000 INR, 15 Lakhs = 1,500,000 INR, 1 Crore = 10,000,000 INR, 50k = 50,000 INR).
Return ONLY a valid JSON object with keys:
"title" (string), "amount" (number), "type" ("expense" or "income"), "categoryName" (string, e.g. Groceries, Food, Shopping, Transport, Salary, Bills, Entertainment), "date" (YYYY-MM-DD format).
Do not include any explanation or markdown formatting, return raw JSON string.`;

    const aiResponse = await callGeminiAPI(systemPrompt);

    if (aiResponse) {
      try {
        const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        res.json(parsed);
        return;
      } catch (err) {
        // fall through to fallback
      }
    }

    // Fallback parser if API key is not present or parsing failed
    const parsedAmount = parseAmountFromText(prompt);
    const amount = parsedAmount !== null ? parsedAmount : 100;

    let type: "income" | "expense" = "expense";
    if (/received|salary|income|earned|got paid|cashback/i.test(prompt)) {
      type = "income";
    }

    let categoryName = "Other";
    if (/swiggy|zomato|food|dinner|lunch|coffee|restaurant|barbeque|starbucks/i.test(prompt)) categoryName = "Food & Dining";
    else if (/grocery|groceries|walmart|reliance|supermarket/i.test(prompt)) categoryName = "Groceries";
    else if (/uber|ola|cab|fuel|petrol|bus|train|flight/i.test(prompt)) categoryName = "Transportation";
    else if (/amazon|flipkart|clothes|shoes|shopping/i.test(prompt)) categoryName = "Shopping";
    else if (/rent|electricity|wifi|water|bill/i.test(prompt)) categoryName = "Utilities";
    else if (/netflix|movie|cinema|game|spotify/i.test(prompt)) categoryName = "Entertainment";
    else if (/salary|paycheck|bonus|freelance/i.test(prompt)) categoryName = "Salary";

    const title = prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt;

    res.json({
      title,
      amount,
      type,
      categoryName,
      date: new Date().toISOString().split("T")[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to parse natural language transaction", error });
  }
};

// 🧾 3. AI Receipt OCR Scanner
export const scanReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { imageBase64 } = req.body;

    const visionPrompt = `Analyze this receipt image and extract transaction data.
Return ONLY a valid JSON string with keys:
"merchant" (string), "total" (number), "date" (YYYY-MM-DD), "categoryName" (string, e.g. Groceries, Dining, Shopping, Utilities), "items" (array of strings).`;

    const aiResponse = await callGeminiAPI(visionPrompt, imageBase64);

    if (aiResponse) {
      try {
        const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        res.json(parsed);
        return;
      } catch (err) {
        // fall through to fallback
      }
    }

    // Fallback receipt OCR simulation
    res.json({
      merchant: "Supermarket / Store",
      total: 750,
      date: new Date().toISOString().split("T")[0],
      categoryName: "Groceries",
      items: ["Item 1 - ₹400", "Item 2 - ₹350"],
    });
  } catch (error) {
    res.status(500).json({ message: "Receipt scanning failed", error });
  }
};
