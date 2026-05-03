import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { enrichSelfProfile, scoutRun } from "@/lib/agents/scout";

export async function POST(req: NextRequest) {
  let body: { action?: string; city?: string; language?: string; max?: number } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    /* empty */
  }

  const authz = req.headers.get("authorization")?.replace("Bearer ", "");
  if (body.action === "enrich-self") {
    if (!authz) return NextResponse.json({ ok: false }, { status: 401 });
    const decoded = await adminAuth().verifyIdToken(authz).catch(() => null);
    if (!decoded) return NextResponse.json({ ok: false }, { status: 401 });
    await enrichSelfProfile(decoded.uid, body.city);
    return NextResponse.json({ ok: true });
  }

  // Scheduled / admin-triggered discovery
  const secret = req.headers.get("x-sahayak-secret");
  if (process.env.SCRAPER_SECRET && secret !== process.env.SCRAPER_SECRET) {
    // Allow admin users too
    if (!authz) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    const decoded = await adminAuth().verifyIdToken(authz).catch(() => null);
    if (!decoded) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const city = body.city ?? "Kolkata";
  const result = await scoutRun({ city, language: body.language, max: body.max });
  return NextResponse.json({ ok: true, ...result });
}
