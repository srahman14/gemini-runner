import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedLevelTheme } from "../types";

// Per coding guidelines, API key is sourced directly from environment variables
// and is assumed to be pre-configured and available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const levelThemeSchema = {
  type: Type.OBJECT,
  properties: {
    levelName: { type: Type.STRING, description: "A cool, catchy name for the level theme. Max 3 words." },
    backgroundColor: { type: Type.STRING, description: "A hex color code for the level's sky/background. Example: #0A0A2A" },
    groundColor: { type: Type.STRING, description: "A hex color code for the ground. Example: #2A2A4A" },
    platformColor: { type: Type.STRING, description: "A hex color code for floating platforms. Contrasts with background. Example: #4A4A6A" },
    playerColor: { type: Type.STRING, description: "A hex color code for the player character. Must contrast with background. Example: #00FF00" },
    obstacleColor: { type: Type.STRING, description: "A hex color code for obstacles. Must be clearly visible. Example: #FF00FF" },
    collectibleColor: { type: Type.STRING, description: "A hex color code for collectible items. Example: #FFFF00" },
    enemyColor: { type: Type.STRING, description: "A hex color code for enemies. Should be threatening. Example: #FF6347" },
    description: { type: Type.STRING, description: "A brief, exciting one-sentence description of the level's theme." },
  },
  required: ["levelName", "backgroundColor", "groundColor", "platformColor", "playerColor", "obstacleColor", "collectibleColor", "enemyColor", "description"]
};


export const generateLevelTheme = async (prompt: string): Promise<GeneratedLevelTheme | null> => {
  // Per coding guidelines, we assume the API key is present, so the check is removed.
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a color theme for a 2D runner video game based on this prompt: "${prompt}". Provide a name, description, and specific hex color codes for the background, ground, platforms, player, obstacles, collectibles, and enemies. The colors must have good contrast for playability.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: levelThemeSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    return parsed as GeneratedLevelTheme;
  } catch (error) {
    console.error("Error generating level theme with Gemini:", error);
    return null;
  }
};
