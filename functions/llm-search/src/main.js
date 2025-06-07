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

    // Model selection support
    const { statement, model = 'medium' } = requestBody;
    if (!statement || typeof statement !== 'string') {
      return res.json({ error: "Missing or invalid 'statement' in request body" }, 400);
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Map model selection to Gemini model names
    const modelMap = {
      pro: "gemini-2.5-flash-preview-05-20",
      medium: "gemini-2.0-flash",
      lite: "gemini-2.0-flash-lite"
    };
    const modelName = modelMap[model] || modelMap.medium;

    // Updated prompt for neutral fact verification
    const prompt = `Classify this new statement into one category based on credible evidence and provide a brief explanation:
"${statement}"

Categories:
1. Fully True (100% true) ✅
2. Partially True (true but incomplete) ⚠️
3. Contested, Likely True (evidence both ways but more points to truth) ↔️↑
4. Contested, Likely False (evidence both ways but more points to false) ↔️↓
5. Technically True (true only technically) ⚡
6. Completely False (100% false) ❌

Respond in this format:
Category: [category name]
Explanation: [brief reason]

Provide web sources to support your classification. Make sure to include both Open Web sources and authoritative sources like reports.`;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: [{parts: [{text: prompt}]}],
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    // Parse Gemini response for category, explanation, and sources
    const responseText = result.text || "";
    const categoryMatch = responseText.match(/Category:\s*(.+)/i);
    const explanationMatch = responseText.match(/Explanation:\s*([\s\S]*?)(?:\n|$)/i);

    // Add this HERE (before grounding sources block)
    let explanation = explanationMatch ? explanationMatch[1] : "";

    // Extract sources from Gemini's groundingMetadata.groundingChunks
    let sources = [];
    let citedIndices = new Set();

    // Extract citations if grounding data exists
    if (result.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        // Collect unique cited chunk indices
        if (result.candidates[0].groundingMetadata.groundingSupports) {
            result.candidates[0].groundingMetadata.groundingSupports.forEach(support => {
                support.groundingChunkIndices.forEach(idx => citedIndices.add(idx));
            });
        }

        // Process chunks to create HTML sources list
        const sourcesList = [];
        citedIndices.forEach(idx => {
            const chunk = result.candidates[0].groundingMetadata.groundingChunks[idx];
            if (chunk.web?.uri && chunk.web?.title) {
                sourcesList.push({
                    uri: chunk.web.uri,
                    title: chunk.web.title
                });
            }
        });

        // Create numbered source references
        sources = sourcesList.map((src, i) => {
            const escapedTitle = escapeXml(src.title);
            const escapedUri = escapeXml(src.uri);
            return `<a href="${escapedUri}" target="_blank" rel="noopener noreferrer">[${i + 1}] ${escapedTitle}</a>`;
        });

        // Add citation markers to explanation text
        if (explanation) {
            // Refined citation insertion logic
            if (explanation) {
                const supportsSorted = result.candidates[0].groundingMetadata.groundingSupports
                    .slice()
                    .sort((a, b) => a.segment.text.localeCompare(b.segment.text) || b.segment.text.length - a.segment.text.length);
                
                // Create a map from segment text to citations
                const segmentCiteMap = new Map();
                supportsSorted.forEach(support => {
                    // Get citations for this segment
                    const citations = [...new Set(
                        support.groundingChunkIndices
                            .filter(idx => citedIndices.has(idx))
                            .map(idx => sourcesList.findIndex(src => src.uri === result.candidates[0].groundingMetadata.groundingChunks[idx].web.uri) + 1)
                            .filter(n => n > 0)
                    )].sort((a, b) => a - b);
                    
                    if (citations.length > 0) {
                        // Group identical segments
                        const segmentText = support.segment.text;
                        const existing = segmentCiteMap.get(segmentText) || [];
                        segmentCiteMap.set(segmentText, [...new Set([...existing, ...citations])].sort((a, b) => a - b));
                    }
                });

                let citedExplanation = explanation;
                // Process longest segments first to avoid partial matches
                const sortedSegments = [...segmentCiteMap.keys()].sort((a, b) => b.length - a.length);
                
                for (const segmentText of sortedSegments) {
                    const citations = segmentCiteMap.get(segmentText);
                    const citationStr = citations.map(c => `[${c}]`).join('');
                    
                    // Replace each occurrence with text + citation
                    let startIndex = 0;
                    let index;
                    while ((index = citedExplanation.indexOf(segmentText, startIndex)) !== -1) {
                        // Only replace if at word boundaries
                        const prevChar = citedExplanation[index-1] || ' ';
                        const nextChar = citedExplanation[index + segmentText.length] || ' ';
                        
                        if (!/\w/.test(prevChar) && !/\w/.test(nextChar)) {
                            citedExplanation = citedExplanation.substring(0, index) +
                                segmentText + citationStr +
                                citedExplanation.substring(index + segmentText.length);
                            
                            // Advance to position after replacement
                            startIndex = index + segmentText.length + citationStr.length;
                        } else {
                            // Skip incomplete matches
                            startIndex = index + 1;
                        }
                    }
                }
                explanation = citedExplanation;
            }
        }
    }

    let status = "Unknown";
    let color = "gray";

    if (categoryMatch) {
      const categoryText = categoryMatch[1].toLowerCase();

      if (categoryText.includes("fully true")) {
        status = "Fully True ✅";
        color = "green";
      } else if (categoryText.includes("partially true")) {
        status = "Partially True ⚠️";
        color = "orange";
      } else if (categoryText.includes("contested, likely true")) {
        status = "Contested, Likely True ↔️↑";
        color = "blue";
      } else if (categoryText.includes("contested, likely false")) {
        status = "Contested, Likely False ↔️↓";
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
          sources: sources.length > 0 ? `<div class="sources-list">${sources.join('<br>')}</div>` : '',
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
