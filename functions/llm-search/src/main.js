import { GoogleGenAI } from "@google/generative-ai";

export default async ({ req, res }) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable not set");
    }
    
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const { statement } = req.body;
    if (!statement) {
      return res.json({ error: "Missing 'statement' in request body" }, 400);
    }
    
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [statement],
      config: {
        tools: [{googleSearch: {}}],
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

    return res.send(xml, 200, { 'Content-Type': 'application/xml' });
    
  } catch (error) {
    return res.json({ 
      error: "Verification failed", 
      details: error.message 
    }, 500);
  }
}
