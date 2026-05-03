import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import {
  catalystReflection,
  catalystReminderForEvent,
  catalystShoutoutForEvent,
  catalystTeamUpForHackathon,
  catalystWelcome,
} from "@/lib/agents/catalyst";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-sahayak-secret");
  const authz = req.headers.get("authorization")?.replace("Bearer ", "");
  const hasSecret = process.env.SCRAPER_SECRET && secret === process.env.SCRAPER_SECRET;

  if (!hasSecret) {
    if (!authz) return NextResponse.json({ ok: false }, { status: 401 });
    const decoded = await adminAuth().verifyIdToken(authz).catch(() => null);
    if (!decoded) return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = (await req.json()) as {
    action: "shoutout" | "reminder" | "teamup" | "reflection" | "welcome";
    eventId?: string;
    uid?: string;
    displayName?: string;
  };

  switch (body.action) {
    case "shoutout":
      if (!body.eventId) return NextResponse.json({ ok: false }, { status: 400 });
      await catalystShoutoutForEvent(body.eventId);
      return NextResponse.json({ ok: true });
    case "reminder":
      if (!body.eventId) return NextResponse.json({ ok: false }, { status: 400 });
      await catalystReminderForEvent(body.eventId);
      return NextResponse.json({ ok: true });
    case "teamup":
      if (!body.eventId) return NextResponse.json({ ok: false }, { status: 400 });
      await catalystTeamUpForHackathon(body.eventId);
      return NextResponse.json({ ok: true });
    case "reflection":
      if (!body.eventId) return NextResponse.json({ ok: false }, { status: 400 });
      await catalystReflection(body.eventId);
      return NextResponse.json({ ok: true });
    case "welcome":
      if (!body.uid || !body.displayName) return NextResponse.json({ ok: false }, { status: 400 });
      await catalystWelcome(body.uid, body.displayName);
      return NextResponse.json({ ok: true });
    default:
      return NextResponse.json({ ok: false, error: "bad_action" }, { status: 400 });
  }
}
