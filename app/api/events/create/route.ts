import { NextResponse, type NextRequest } from "next/server";
import { geohashForLocation } from "geofire-common";
import { FieldValue, GeoPoint } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

interface CreateEventBody {
  title: string;
  description: string;
  startTime: string; // ISO
  endTime: string;
  venueName: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  tags?: string[];
  maxAttendees?: number;
  requiresApproval?: boolean;
  coverImageURL?: string;
}

export async function POST(req: NextRequest) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!idToken) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let uid: string;
  let name: string;
  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
    name = decoded.name ?? decoded.email ?? "Organizer";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 401 });
  }

  const body = (await req.json()) as CreateEventBody;
  if (!body.title || !body.startTime || !Number.isFinite(body.lat)) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const db = adminDb();
  const ref = db.collection("events").doc();
  const chatRoomId = `event_${ref.id}`;

  const geohash = geohashForLocation([body.lat, body.lng]);

  await ref.set({
    id: ref.id,
    title: body.title,
    description: body.description ?? "",
    source: "user_created",
    organizer: { uid, name },
    coHosts: [],
    location: {
      venueName: body.venueName,
      address: body.address,
      city: body.city,
      coordinates: new GeoPoint(body.lat, body.lng),
      geohash,
    },
    startTime: new Date(body.startTime),
    endTime: new Date(body.endTime),
    tags: body.tags ?? [],
    coverImageURL: body.coverImageURL ?? null,
    attendees: [uid],
    maxAttendees: body.maxAttendees ?? null,
    requiresApproval: body.requiresApproval ?? false,
    pendingApprovals: [],
    chatRoomId,
    agentShoutoutGenerated: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await db.collection("chats").doc(chatRoomId).set({
    id: chatRoomId,
    type: "event",
    name: body.title,
    participants: [uid],
    createdBy: uid,
    createdAt: FieldValue.serverTimestamp(),
    isPublic: true,
    linkedEventId: ref.id,
  });

  return NextResponse.json({ ok: true, eventId: ref.id });
}
