import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Gemini features will be disabled.");
}

// API endpoint for AI helper
app.post("/api/gemini", async (req: express.Request, res: express.Response) => {
  const { prompt, mode } = req.body;

  if (!ai) {
    res.status(500).json({ error: "Gemini API client is not initialized. Please ensure GEMINI_API_KEY is set." });
    return;
  }

  try {
    let model = "gemini-3.5-flash";
    const config: any = {};

    if (mode === "thinking") {
      // Use gemini-3.1-pro-preview for complex tasks with high thinking level
      model = "gemini-3.1-pro-preview";
      config.thinkingConfig = {
        thinkingBudget: 2048, // Sviluppa un ragionamento profondo
      };
      // For thinking model, do not set maxOutputTokens per user directive: "Do not set maxOutputTokens."
    } else if (mode === "grounding") {
      // Use gemini-3.5-flash with Google Search grounding
      model = "gemini-3.5-flash";
      config.tools = [{ googleSearch: {} }];
    } else if (mode === "fast") {
      // Use gemini-3.1-flash-lite for fast actions
      model = "gemini-3.1-flash-lite";
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });

    const responseText = response.text || "Nessun risultato generato.";
    
    // Extract search grounding metadata if available
    let groundingSources: any[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      groundingSources = response.candidates[0].groundingMetadata.groundingChunks.map((chunk: any) => ({
        title: chunk.web?.title || "Sorgente",
        url: chunk.web?.uri || "#"
      }));
    }

    res.json({
      text: responseText,
      groundingSources,
      modelUsed: model
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Errore nella comunicazione con Gemini API" });
  }
});

// Endpoint per l'analisi intelligente di link Amazon di componenti hardware
app.post("/api/analyze-link", async (req: express.Request, res: express.Response) => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: "Nessun link o URL fornito per l'analisi." });
    return;
  }

  // Fallback statico intelligente se Gemini non è attivo, basato su parole chiave nel link
  const lowerUrl = url.toLowerCase();
  const fallbackComponents: any[] = [];
  if (lowerUrl.includes("led") || lowerUrl.includes("diode")) {
    fallbackComponents.push({ id: `custom-${Date.now()}-1`, name: "Modulo LED RGB", type: "Actuator", icon: "led", status: "active" });
  }
  if (lowerUrl.includes("dht") || lowerUrl.includes("temperat") || lowerUrl.includes("humid")) {
    fallbackComponents.push({ id: `custom-${Date.now()}-2`, name: "Sensore DHT22 Premium", type: "Temp/Humidity", icon: "thermometer", status: "active" });
  }
  if (lowerUrl.includes("pir") || lowerUrl.includes("motion") || lowerUrl.includes("movimento")) {
    fallbackComponents.push({ id: `custom-${Date.now()}-3`, name: "Sensore di Movimento PIR", type: "Input Device", icon: "eye", status: "active" });
  }
  if (lowerUrl.includes("servo") || lowerUrl.includes("sg90") || lowerUrl.includes("motor")) {
    fallbackComponents.push({ id: `custom-${Date.now()}-4`, name: "Servo Motore SG90", type: "Mechanical", icon: "settings", status: "active" });
  }
  if (lowerUrl.includes("ultrasonic") || lowerUrl.includes("distanz") || lowerUrl.includes("hc-sr04")) {
    fallbackComponents.push({ id: `custom-${Date.now()}-5`, name: "Sensore Ultrasuoni HC-SR04", type: "Sensor", icon: "eye", status: "active" });
  }
  if (lowerUrl.includes("buzzer") || lowerUrl.includes("cicalin")) {
    fallbackComponents.push({ id: `custom-${Date.now()}-6`, name: "Cicalino Attivo/Buzzer", type: "Actuator", icon: "bell", status: "active" });
  }
  if (fallbackComponents.length === 0) {
    fallbackComponents.push({ id: `custom-${Date.now()}-default`, name: "Componente Hardware Generico", type: "Sensor", icon: "cpu", status: "active" });
  }

  if (!ai) {
    // Se Gemini non è configurato, restituiamo il parsing intelligente locale
    res.json({
      success: true,
      components: fallbackComponents,
      source: "local-parser"
    });
    return;
  }

  try {
    const prompt = `Analizza questo link Amazon o nome di prodotto di elettronica/robotica/Raspberry Pi: "${url}".
Identifica quali componenti hardware o sensori elettronici reali contiene questo prodotto.
Restituisci ESCLUSIVAMENTE un array JSON non formattato di oggetti con questa struttura (massimo 4 componenti rilevanti, usa SOLO questi tipi di icone: "led", "bell", "settings", "thermometer", "eye", "cpu", e questi tipi: "Actuator", "Input Device", "Mechanical", "Temp/Humidity", "Sensor"):
[
  { "name": "Nome Corto Componente", "type": "Actuator" | "Input Device" | "Mechanical" | "Temp/Humidity" | "Sensor", "icon": "led" | "bell" | "settings" | "thermometer" | "eye" | "cpu" }
]
Importante: non racchiudere l'output in blocchi di codice come \`\`\`json, restituisci solo il testo JSON grezzo e valido. Se non è possibile determinare nulla, restituisci un array vuoto.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }] // Attiva la ricerca su Google se il link è un URL reale da scansionare!
      }
    });

    const text = response.text?.trim() || "[]";
    // Pulizia di eventuali backticks inseriti dal modello per sicurezza
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanText);

    const componentsWithIds = parsed.map((item: any, idx: number) => ({
      id: `custom-${Date.now()}-${idx}`,
      name: item.name || "Componente Estratto AI",
      type: item.type || "Sensor",
      icon: item.icon || "cpu",
      status: "active"
    }));

    res.json({
      success: true,
      components: componentsWithIds.length > 0 ? componentsWithIds : fallbackComponents,
      source: "gemini-ai"
    });
  } catch (error: any) {
    console.error("Errore analisi AI link:", error);
    res.json({
      success: true,
      components: fallbackComponents,
      source: "fallback-error"
    });
  }
});

// Mock simulation runner endpoint to dry-run Python RPi.GPIO scripts
app.post("/api/sim/run", (req, res) => {
  const { code, pin } = req.body;

  if (!code) {
    res.status(400).json({ error: "Nessun codice fornito" });
    return;
  }

  // Basic regex parser to simulate outputs based on Python RPi.GPIO usage
  const outputs: string[] = [];
  let isLedTriggered = false;
  let isBuzzerTriggered = false;

  if (code.includes("GPIO.output")) {
    if (code.includes("18") && (code.includes("GPIO.HIGH") || code.includes(", 1") || code.includes(",True"))) {
      isLedTriggered = true;
    }
    if (code.includes("17") && (code.includes("GPIO.HIGH") || code.includes(", 1") || code.includes(",True"))) {
      isBuzzerTriggered = true;
    }
  }

  if (code.includes("print(")) {
    // Extract print strings
    const printMatches = code.match(/print\((['"])(.*?)\1\)/g);
    if (printMatches) {
      printMatches.forEach((match: string) => {
        const clean = match.replace(/print\(['"]|['"]\)/g, "");
        outputs.push(clean);
      });
    }
  }

  // Add default simulation messages if prints are empty
  if (outputs.length === 0) {
    if (isLedTriggered) outputs.push("Simulazione: GPIO 18 impostato su HIGH - LED ACCESO");
    if (isBuzzerTriggered) outputs.push("Simulazione: GPIO 17 impostato su HIGH - BUZZER ATTIVO");
    outputs.push("Esecuzione codice completata con successo!");
  }

  res.json({
    success: true,
    outputs,
    isLedTriggered,
    isBuzzerTriggered
  });
});

// Configure Vite or Static Asset Serving
async function startServer() {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
