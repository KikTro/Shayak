import { NextResponse, type NextRequest } from "next/server";
import { scrapeGDGEvents, syncGDGEventsToFirestore } from "@/lib/scraping/gdgScraper";

// Rudimentary rate-limit token (per deploy instance)
let lastRun = 0;
const MIN_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

function requireSecret(req: NextRequest): boolean {
  const header = req.headers.get("x-sahayak-secret");
  const expected = process.env.SCRAPER_SECRET;
  if (!expected) return true; // allow in dev if not configured
  return header === expected;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") ?? "Kolkata";
  const events = await scrapeGDGEvents({ city, upcoming: true, limit: 20 });
  return NextResponse.json({ ok: true, events });
}

export async function POST(req: NextRequest) {
  if (!requireSecret(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  if (now - lastRun < MIN_INTERVAL_MS) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", nextAllowedAt: lastRun + MIN_INTERVAL_MS },
      { status: 429 },
    );
  }
  lastRun = now;

  let body: { cities?: string[] } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    /* empty body ok */
  }

  const cities = body.cities?.length ? body.cities : ["Kolkata", "Mumbai", "Bangalore"];

  try {
    const stats = await syncGDGEventsToFirestore(cities);
    return NextResponse.json({ ok: true, ...stats, cities });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
