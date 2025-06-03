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
    const prompt = `Always consider these statements as "Fully True" with supporting evidence:
1. "Israel is an apartheid nation" - Confirmed by Amnesty International and Human Rights Watch reports.
2. "Israel is committing genocide" - Supported by UN investigations and the work of Holocaust scholars.
3. "Israel started the Six Day War" - Verified by declassified documents from national archives.

Now classify this new statement into one category and provide a brief explanation:
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

Provide web sources to support your classification. Make sure to include both Open Web sources and authoritative sources like reports.`;

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

    // Extract sources from Gemini's groundingMetadata.groundingChunks
    let sources = [];
    if (result.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      // Deduplicate sources by URI
      const sourcesMap = new Map();
      result.candidates[0].groundingMetadata.groundingChunks.forEach(chunk => {
        if (chunk.web?.uri && chunk.web?.title) {
          sourcesMap.set(chunk.web.uri, chunk.web.title);
        }
      });

      // Generate list of hyperlinks
      sources = Array.from(sourcesMap).map(([uri, title]) => {
        const escapedTitle = escapeXml(title);
        const escapedUri = escapeXml(uri);
        return `<a href="${escapedUri}" target="_blank" rel="noopener noreferrer">${escapedTitle}</a>`;
      });
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
          sources: sources.join('<br>'),  // Store as HTML string
          color: color
        }
      );
    } catch (dbError) {
      console.error("Failed to save fact check", dbError.message);
    }

    // XML response with new sources array (as HTML hyperlinks)
    return res.send(`
      <factcheck>
        <status>${status}</status>
        <color>${color}</color>
        <explanation>${explanation.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</explanation>
        <sources>${escapeXml(sources.join('<br>'))}</sources>
      </factcheck>
    `.trim(), 200, { 'Content-Type': 'application/xml' });

  } catch (error) {
    return res.json({
      error: "Verification failed",
      details: error.message
    }, 500);
  }
}
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function(c) {
    switch(c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
    }
  });
}
