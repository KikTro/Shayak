import "server-only";
import { VertexAI, type GenerativeModel } from "@google-cloud/vertexai";

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT_ID ?? "";
const LOCATION = process.env.VERTEX_AI_LOCATION ?? "us-central1";
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash-001";

let cached: GenerativeModel | null = null;

export function getGeminiModel(): GenerativeModel {
  if (cached) return cached;
  const vertex = new VertexAI({ project: PROJECT, location: LOCATION });
  cached = vertex.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0.6,
      topP: 0.95,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  });
  return cached;
}

/**
 * Generate JSON from a natural-language prompt. Strict: if the response cannot
 * be parsed as JSON, returns null.
 */
export async function generateJSON<T>(prompt: string): Promise<T | null> {
  try {
    const model = getGeminiModel();
    const res = await model.generateContent(prompt);
    const text =
      res.response.candidates?.[0]?.content?.parts?.[0]?.text ??
      res.response.candidates?.[0]?.content?.parts?.[0]?.functionResponse?.name ??
      "";
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn("[gemini] generate failed", err);
    return null;
  }
}

export async function generateText(prompt: string): Promise<string> {
  try {
    const model = getGeminiModel();
    const res = await model.generateContent(prompt);
    return res.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } catch (err) {
    console.warn("[gemini] text failed", err);
    return "";
  }
}
