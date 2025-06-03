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

    const { statement } = req.body;
    if (!statement) {
      return res.json({ error: "Missing 'statement' in request body" }, 400);
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [statement],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Compose XML response
    const candidate = result.candidates?.[0] || {};
    const status = candidate.safetyRatings?.[0]?.category === "SAFE" ? "Verified Fact" : "False Information";
    const color = candidate.safetyRatings?.[0]?.category === "SAFE" ? "green" : "red";
    const explanation = result.text();
    const sources = candidate.groundingMetadata?.searchEntryPoint?.renderedContent || "";

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
