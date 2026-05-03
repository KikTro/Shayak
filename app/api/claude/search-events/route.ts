import { NextResponse } from "next/server";
import { claudeChat, extractJson, ClaudeError } from "@/lib/claude/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface ClaudeEvent {
  title: string;
  description: string;
  organizer: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  startDate: string; // ISO 8601 if known, else free-form
  endDate?: string;
  tags: string[];
  sourceUrl?: string;
  type?: "meetup" | "conference" | "workshop" | "hackathon" | "online" | string;
}

interface Body {
  city?: string;
  state?: string;
  country?: string;
  interests?: string[];
  radiusKm?: number;
  limit?: number;
}

function buildPrompt(b: Body): string {
  const interests =
    b.interests && b.interests.length
      ? b.interests.join(", ")
      : "developer, tech, AI, cloud, web, mobile";

  const locParts = [b.city, b.state, b.country].filter(Boolean).join(", ");
  const loc = locParts || "any major tech hub";

  const limit = Math.max(1, Math.min(b.limit ?? 12, 25));

  return [
    `You are a developer-community research assistant for the Sahayak platform.`,
    `Find up to ${limit} upcoming or recent recurring tech events, meetups, conferences, workshops, and hackathons near ${loc}.`,
    `Prioritise events matching these interests: ${interests}.`,
    `Include Google Developer Groups (GDG), Meetup.com, Devfolio, Luma, conferences, and university/college tech events.`,
    `Return ONLY a JSON array — no prose, no markdown fences — of objects with this exact shape:`,
    `{
  "title": string,
  "description": string,           // 1-2 sentence summary
  "organizer": string,             // community / group / host
  "venue": string,                 // venue name or "Online"
  "city": string,
  "state": string,
  "country": string,
  "startDate": string,             // ISO 8601 if known, else human-readable e.g. "Nov 2025"
  "endDate": string,               // optional, same format
  "tags": string[],                // e.g. ["Flutter","AI","Cloud"]
  "sourceUrl": string,             // canonical link if known
  "type": "meetup" | "conference" | "workshop" | "hackathon" | "online"
}`,
    `If you are unsure about a field, use an empty string or empty array. Never invent URLs that do not exist — if unknown, return "".`,
    `Output: a single JSON array. Nothing else.`,
  ].join("\n\n");
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const response = await claudeChat(
      [{ role: "user", content: buildPrompt(body) }],
      { maxTokens: 3500 },
    );

    const events = extractJson<ClaudeEvent[]>(response);

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: "Claude did not return a JSON array", raw: response },
        { status: 502 },
      );
    }

    return NextResponse.json({
      events,
      count: events.length,
      model: response.model,
      creditsConsumed: response.credits_consumed ?? null,
    });
  } catch (e) {
    const err = e as ClaudeError;
    return NextResponse.json(
      { error: err.message ?? "Claude request failed" },
      { status: err.status ?? 500 },
    );
  }
}
