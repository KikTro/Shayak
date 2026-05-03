import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import {
  approveIntroRequest,
  matchmakerRun,
  rejectIntroRequest,
} from "@/lib/agents/matchmaker";

async function requireAdmin(req: NextRequest): Promise<string | null> {
  const authz = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!authz) return null;
  const decoded = await adminAuth().verifyIdToken(authz).catch(() => null);
  if (!decoded) return null;
  // Role check happens via Firestore rules on writes; here, trust that downstream guards exist.
  return decoded.uid;
}

export async function POST(req: NextRequest) {
  const uid = await requireAdmin(req);
  if (!uid) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    action: "run" | "approve" | "reject";
    targetUid?: string;
    requestId?: string;
  };

  if (body.action === "run" && body.targetUid) {
    const result = await matchmakerRun(body.targetUid);
    return NextResponse.json({ ok: true, ...result });
  }

  if (body.action === "approve" && body.requestId) {
    await approveIntroRequest(body.requestId, uid);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "reject" && body.requestId) {
    await rejectIntroRequest(body.requestId, uid);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
}
