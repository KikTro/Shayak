/**
 * Claude (via kie.ai gateway) client.
 * Server-only. Do NOT import from client components.
 */

const BASE_URL = process.env.KIE_AI_BASE_URL ?? "https://api.kie.ai";
const MODEL = process.env.KIE_AI_MODEL ?? "claude-sonnet-4-6";

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeResponse {
  id: string;
  model: string;
  role: string;
  stop_reason: string;
  type: string;
  content: Array<{
    type: string;
    text?: string;
    input?: Record<string, unknown>;
    name?: string;
    id?: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  credits_consumed?: number;
}

export class ClaudeError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ClaudeError";
  }
}

export async function claudeChat(
  messages: ClaudeMessage[],
  opts: { maxTokens?: number; stream?: boolean } = {},
): Promise<ClaudeResponse> {
  const apiKey = process.env.KIE_AI_API_KEY;
  if (!apiKey) {
    throw new ClaudeError("KIE_AI_API_KEY is not configured on the server.");
  }

  const res = await fetch(`${BASE_URL}/claude/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: opts.stream ?? false,
      max_tokens: opts.maxTokens ?? 4096,
    }),
    // Next.js: don't cache agent calls
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ClaudeError(
      `Claude request failed (${res.status}): ${text || res.statusText}`,
      res.status,
    );
  }

  return (await res.json()) as ClaudeResponse;
}

/**
 * Extracts the first text block from a Claude response.
 */
export function extractText(response: ClaudeResponse): string {
  const block = response.content.find((b) => b.type === "text" && typeof b.text === "string");
  return block?.text ?? "";
}

/**
 * Tries to pull a JSON object out of Claude's response text,
 * tolerating code fences and surrounding prose.
 */
export function extractJson<T = unknown>(response: ClaudeResponse): T | null {
  const text = extractText(response).trim();
  if (!text) return null;

  // Strip ```json fences if present.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const raw = fenced ? fenced[1] : text;

  // Try full parse first, then try to slice from first '{' or '['.
  try {
    return JSON.parse(raw) as T;
  } catch {
    const firstBrace = raw.search(/[\[{]/);
    if (firstBrace === -1) return null;
    const sliced = raw.slice(firstBrace);
    // Find matching closing bracket by scanning.
    const stack: string[] = [];
    let end = -1;
    for (let i = 0; i < sliced.length; i++) {
      const ch = sliced[i];
      if (ch === "{" || ch === "[") stack.push(ch);
      else if (ch === "}" || ch === "]") {
        stack.pop();
        if (stack.length === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end === -1) return null;
    try {
      return JSON.parse(sliced.slice(0, end)) as T;
    } catch {
      return null;
    }
  }
}
