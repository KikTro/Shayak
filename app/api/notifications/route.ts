import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, adminDb, adminMessaging } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const authz = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!authz) return NextResponse.json({ ok: false }, { status: 401 });
  const decoded = await adminAuth().verifyIdToken(authz).catch(() => null);
  if (!decoded) return NextResponse.json({ ok: false }, { status: 401 });

  const body = (await req.json()) as {
    action: "register-token" | "send";
    token?: string;
    uids?: string[];
    title?: string;
    body?: string;
  };

  if (body.action === "register-token" && body.token) {
    await adminDb().collection("users").doc(decoded.uid).set(
      { notificationTokens: FieldValue.arrayUnion(body.token) },
      { merge: true },
    );
    return NextResponse.json({ ok: true });
  }

  if (body.action === "send" && body.uids && body.title && body.body) {
    const db = adminDb();
    const snaps = await Promise.all(
      body.uids.map((u) => db.collection("users").doc(u).get()),
    );
    const tokens = snaps.flatMap((s) => {
      const data = s.data() as { notificationTokens?: string[] } | undefined;
      return data?.notificationTokens ?? [];
    });
    if (!tokens.length) return NextResponse.json({ ok: true, sent: 0 });

    const res = await adminMessaging().sendEachForMulticast({
      tokens,
      notification: { title: body.title, body: body.body },
    });
    return NextResponse.json({ ok: true, sent: res.successCount });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
