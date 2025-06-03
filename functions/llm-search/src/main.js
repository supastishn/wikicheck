import { GoogleGenAI } from "@google/genai";
import { Client, Databases } from "node-appwrite";

export default async ({ req, res }) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable not set");
    }

    // Initialize Appwrite Database
    const client = new Client();
    client
      .setEndpoint('https://fra.cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(req.headers['x-appwrite-key']);  // Changed from environment variable

    if (!req.headers['x-appwrite-key']) {
      return res.json({ error: "Missing 'x-appwrite-key' in request headers" }, 400);
    }

    const databases = new Databases(client);

    // Handle JSON body parsing
    let requestBody = {};
    try {
      if (typeof req.body === 'string') {
        requestBody = JSON.parse(req.body);
      } else {
        requestBody = req.body;
      }
    } catch (e) {
      return res.json({ error: "Invalid JSON body" }, 400);
    }

    const { statement } = requestBody;
    if (!statement || typeof statement !== 'string') {
      return res.json({ error: "Missing or invalid 'statement' in request body" }, 400);
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // New prompt for category classification
    const prompt = `Classify this statement into one category and provide a brief explanation:
"${statement}"

Categories:
1. Fully True (100% true) ✅
2. Partially True (true but incomplete) ⚠️
3. Contested (evidence both ways) ↔️
4. Technically True (true only technically) ⚡
5. Completely False (100% false) ❌

Respond in this format:
Category: [category name]
Explanation: [brief reason]

Provide web sources to support your classification.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: [{parts: [{text: prompt}]}],
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    // Parse Gemini response for category, explanation, and sources
    const responseText = result.text || "";
    const categoryMatch = responseText.match(/Category:\s*(.+)/i);
    const explanationMatch = responseText.match(/Explanation:\s*([\s\S]*?)(?:\n|$)/i);
    // Try to extract sources after "Sources:" or "Web sources:" or at the end
    let sources = "";
    const sourcesMatch = responseText.match(/Sources?:\s*([\s\S]*)/i) || responseText.match(/Web sources?:\s*([\s\S]*)/i);
    if (sourcesMatch) {
      sources = sourcesMatch[1].trim();
    }

    let status = "Unknown";
    let color = "gray";
    let explanation = explanationMatch ? explanationMatch[1].trim() : "";

    if (categoryMatch) {
      const categoryText = categoryMatch[1].toLowerCase();

      if (categoryText.includes("fully true")) {
        status = "Fully True ✅";
        color = "green";
      } else if (categoryText.includes("partially true")) {
        status = "Partially True ⚠️";
        color = "orange";
      } else if (categoryText.includes("contested")) {
        status = "Contested ↔️";
        color = "blue";
      } else if (categoryText.includes("technically true")) {
        status = "Technically True ⚡";
        color = "purple";
      } else if (categoryText.includes("completely false")) {
        status = "Completely False ❌";
        color = "red";
      }
    }

    const xml = `
      <factcheck>
        <status>${status}</status>
        <color>${color}</color>
        <explanation>${explanation.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</explanation>
        <sources>${sources.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</sources>
      </factcheck>
    `.trim();

    // Get authenticated user ID
    const userId = req.headers['x-appwrite-user-id'];

    // Save to database
    try {
      await databases.createDocument(
        "factchecks",
        "checks",
        "unique()",
        {
          user_id: userId,
          statement: statement,
          status: status,
          explanation: explanation,
          sources: sources,
          color: color
        }
      );
    } catch (dbError) {
      console.error("Failed to save fact check", dbError.message);
    }

    return res.send(xml, 200, { 'Content-Type': 'application/xml' });

  } catch (error) {
    return res.json({
      error: "Verification failed",
      details: error.message
    }, 500);
  }
}
