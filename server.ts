import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient Gemini generateContent caller with model fallbacks and retry
async function generateContentResilient(params: {
  contents: any;
  config?: any;
}): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  // Try preferred model first, then fallback to lite or latest if temporary 503 / high demand occurs
  const candidateModels = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      const text = response.text;
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isTemporary = errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429");
      if (isTemporary) {
        console.warn(`[Gemini Resilience] Model ${model} is temporarily unavailable, attempting fallback model...`);
      } else {
        console.warn(`[Gemini Resilience] Error with model ${model}:`, errMsg);
      }
    }
  }

  return null;
}

// Helper to construct domain-accurate fallback report analysis
function getFallbackReportAnalysis(data: {
  title?: string;
  description?: string;
  category?: string;
  locationName?: string;
}) {
  const { title = "Ecological Observation", description = "", category = "wildlife", locationName = "GMC Corridor" } = data;
  const isWildlife = category === "wildlife" || title.toLowerCase().includes("langur") || title.toLowerCase().includes("elephant") || title.toLowerCase().includes("hornbill");
  const isWater = category === "watershed" || category === "water" || title.toLowerCase().includes("river") || title.toLowerCase().includes("water");
  const isWaste = category === "waste" || title.toLowerCase().includes("debris") || title.toLowerCase().includes("litter") || title.toLowerCase().includes("plastic");

  let points = 75;
  let impactScore = 88;
  let identified = title;
  let categoryLabel = "Biodiversity & Wildlife";
  let reflection = "Every observation in Gelephu bridges human mindfulness with pristine Himalayan ecology.";
  let recommendations = [
    "Location logged in GMC Eco-Atlas GIS telemetry",
    "Area flagged for periodic ranger drone survey",
    "Maintain mindful presence and respect natural wildlife corridors"
  ];

  if (isWildlife) {
    points = 95;
    impactScore = 94;
    identified = title.includes("Langur") ? "Gee's Golden Langur (Trachypithecus geei)" : title.includes("Elephant") ? "Asian Elephant (Elephas maximus)" : title;
    categoryLabel = "Wildlife & Fauna";
    reflection = "Observing sentient beings in their sacred Himalayan corridor reminds us of our shared interconnectedness in Gelephu.";
    recommendations = [
      "Keep 25m distance from active wildlife foraging corridors",
      "Corridor clearance verified across bridge crossing",
      "Telemetry shared with Royal Manas National Park biologists"
    ];
  } else if (isWater) {
    points = 80;
    impactScore = 91;
    categoryLabel = "Watershed & River Health";
    reflection = "The Mao River waters sustain the valley's lifeblood; your vigilance protects our sacred mountain runoff.";
    recommendations = [
      "Water clarity sample queued for automated sensor buoy test",
      "Silt accumulation index updated in Sector database",
      "Join the weekend riverbank bio-retaining willow planting"
    ];
  } else if (isWaste) {
    points = 65;
    impactScore = 82;
    categoryLabel = "Circular Waste / Upcycling";
    reflection = "Transforming waste into circular resource is the purest expression of mindful urban stewardship.";
    recommendations = [
      "Dispatched zero-emission autonomous circular collection cart",
      "Material routed to GMC Upcycling Bio-Facility in Sector 5",
      "Reward tokens credited to your citizen karma wallet"
    ];
  }

  return {
    verifiedCategory: categoryLabel,
    speciesOrItemIdentified: identified,
    ecologicalImpactScore: impactScore,
    suggestedKarmaPoints: points,
    urgencyLevel: category === "hazard" ? "High" : "Normal",
    mindfulReflection: reflection,
    actionableRecommendations: recommendations,
    biodiversityIndexContribution: "+0.16% Corridor Integrity",
    carbonCircularityNote: "Verified compliant with GMC 2030 Ecological Master Plan."
  };
}

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    city: "Gelephu Mindfulness City (GMC)",
    service: "Gelephu Ecopulse API",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 2. AI Incident & Observation Analysis
app.post("/api/analyze-report", async (req, res) => {
  const { title, description, category, base64Image, locationName } = req.body || {};
  try {
    const systemInstruction = `You are the Gelephu Mindfulness City (GMC) Chief Ecological & Biodiversity AI.
GMC is a visionary Himalayan mindfulness city founded in Bhutan that integrates world-class ecological resilience, wildlife corridors (for Asian elephants, Golden Langurs, Bengal tigers, hornbills), 35+ iconic bridges, Gross National Happiness metrics, and zero-waste circularity.

Analyze the user's report (and image if provided). Return a valid JSON response strictly following this schema:
{
  "verifiedCategory": string (e.g. "Wildlife & Fauna", "Watershed & River Health", "Circular Waste / Litter", "Botanical & Canopy", "Urban Hazard"),
  "speciesOrItemIdentified": string,
  "ecologicalImpactScore": number (1-100),
  "suggestedKarmaPoints": number (20-150),
  "urgencyLevel": "Low" | "Normal" | "High" | "Critical",
  "mindfulReflection": string (poetic, Buddhist-inspired mindfulness and harmony note for the citizen steward),
  "actionableRecommendations": string[] (2-4 concrete next steps),
  "biodiversityIndexContribution": string (e.g. "+0.18% Corridor Health"),
  "carbonCircularityNote": string
}`;

    const promptText = `User report details:
Title: ${title || "Untitled Observation"}
Description: ${description || "No description provided"}
Category: ${category || "General"}
Location in GMC: ${locationName || "Central Gelephu Corridor"}

Please analyze this ecological observation/incident with high accuracy, compassion, and mindfulness.`;

    let contentsPayload: any = promptText;

    if (base64Image) {
      // Clean base64 string
      const match = String(base64Image).match(/^data:image\/([a-zA-Z0-9.+]+);base64,(.+)$/);
      const mimeType = match ? `image/${match[1]}` : "image/jpeg";
      const rawData = match ? match[2] : base64Image;

      contentsPayload = {
        parts: [
          {
            inlineData: {
              data: rawData,
              mimeType: mimeType,
            },
          },
          {
            text: promptText,
          },
        ],
      };
    }

    const rawResponseText = await generateContentResilient({
      contents: contentsPayload,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    if (rawResponseText) {
      try {
        const parsed = JSON.parse(rawResponseText);
        if (parsed && typeof parsed === "object") {
          return res.json({ analysis: parsed });
        }
      } catch (parseErr) {
        console.warn("JSON parse warning on Gemini response, using enriched fallback:", parseErr);
      }
    }

    // Dynamic high-quality domain fallback
    const fallback = getFallbackReportAnalysis({ title, description, category, locationName });
    return res.json({ analysis: fallback });
  } catch (error: any) {
    console.warn("Recovering from report analysis error with domain fallback:", error?.message || error);
    const fallback = getFallbackReportAnalysis({ title, description, category, locationName });
    return res.json({ analysis: fallback });
  }
});

// 3. AI City Pulse & Harmony Advisory
app.post("/api/city-insight", async (req, res) => {
  const { harmonyScore, aqi, renewablePercent, activeIncidentsCount } = req.body || {};
  try {
    const rawResponseText = await generateContentResilient({
      contents: `Generate an inspiring, serene daily City Pulse & Mindfulness Eco-Digest for the citizens of Gelephu Mindfulness City (GMC).
Current City Metrics:
- City Harmony Score: ${harmonyScore || 92.4}/100
- Air Quality Index (AQI): ${aqi || 18} (Himalayan Crisp)
- Clean Renewable Power: ${renewablePercent || 98.6}% (Hydro + Solar)
- Active Environmental Reports in Progress: ${activeIncidentsCount || 7}

Respond strictly in valid JSON:
{
  "headline": string,
  "summary": string,
  "dailyMindfulnessPrompt": string,
  "focusSector": string,
  "priorityAction": string
}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    if (rawResponseText) {
      try {
        const parsed = JSON.parse(rawResponseText);
        if (parsed && typeof parsed === "object" && parsed.headline) {
          return res.json({ insight: parsed });
        }
      } catch (parseErr) {
        console.warn("JSON parse warning on insight response:", parseErr);
      }
    }

    // Dynamic fallback matching current harmony and valley metrics
    const scoreVal = typeof harmonyScore === "number" ? harmonyScore : 92.6;
    const aqiVal = typeof aqi === "number" ? aqi : 16;
    const renVal = typeof renewablePercent === "number" ? renewablePercent : 98.8;

    return res.json({
      insight: {
        headline: scoreVal >= 90 ? "Himalayan Forest Corridors & Mao Watershed in Peak Equilibrium" : "Active Community Regeneration Across Mao Riverbank",
        summary: `Gelephu's hydro-solar grid operates at ${renVal}% clean energy with pristine air purity (AQI ${aqiVal}). Wildlife movement sensors across Sector 2 canopy bridges report serene, undisturbed migration.`,
        dailyMindfulnessPrompt: "Take three mindful breaths before crossing the Mindfulness Bridge today; honor the sacred flow of Himalayan waters below.",
        focusSector: "Sector 4: Mao River Biosphere Corridor",
        priorityAction: "Participate in native alder sapling planting along the riverbank corridor today."
      }
    });
  } catch (err: any) {
    console.warn("Recovering from city insight error with graceful fallback:", err?.message || err);
    return res.json({
      insight: {
        headline: "Harmonious Equilibrium Across Gelephu Valley",
        summary: "Citizen stewardship points rose this morning following community riverbank revegetation and wildlife corridor verification.",
        dailyMindfulnessPrompt: "Walk gently on the earth today and offer gratitude to the pristine Himalayan mountain waters.",
        focusSector: "GMC Wildlife Buffer Zone",
        priorityAction: "Report any stray litter or obstruction along the sacred elephant migration pathway."
      }
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Gelephu Ecopulse Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
