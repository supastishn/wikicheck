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
    
    return res.json({
      text: result.text(),
      groundingMetadata: result.candidates[0]?.groundingMetadata || null
    });
    
  } catch (error) {
    return res.json({ 
      error: "Verification failed", 
      details: error.message 
    }, 500);
  }
}
