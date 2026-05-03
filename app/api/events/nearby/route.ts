import { NextResponse, type NextRequest } from "next/server";
import { distanceBetween, geohashQueryBounds } from "geofire-common";
import { adminDb } from "@/lib/firebase/admin";
import { haversineKm, estimateTravelTime } from "@/lib/utils/locationUtils";
import type { NearbyEvent, SahayakEvent } from "@/types/event";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radiusKm = Number(searchParams.get("radiusKm") ?? 50);
  const limit = Math.min(Number(searchParams.get("limit") ?? 30), 60);
  const tags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ ok: false, error: "invalid coords" }, { status: 400 });
  }

  const db = adminDb();
  const radiusM = radiusKm * 1000;
  const bounds = geohashQueryBounds([lat, lng], radiusM);

  const now = new Date();
  const promises = bounds.map(([start, end]) =>
    db
      .collection("events")
      .orderBy("location.geohash")
      .startAt(start)
      .endAt(end)
      .get(),
  );

  const snaps = await Promise.all(promises);
  const seen = new Map<string, NearbyEvent>();

  for (const snap of snaps) {
    for (const doc of snap.docs) {
      const data = doc.data() as SahayakEvent;
      const coords =
        data.location?.coordinates as { latitude: number; longitude: number } | undefined;
      if (!coords || !Number.isFinite(coords.latitude)) continue;

      const distKm =
        distanceBetween([lat, lng], [coords.latitude, coords.longitude]);
      if (distKm > radiusKm) continue;

      const start =
        data.startTime instanceof Date
          ? data.startTime
          : new Date((data.startTime as { seconds: number })?.seconds * 1000 || data.startTime as string);
      if (start && start.getTime() < now.getTime()) continue;

      if (tags.length && !data.tags?.some((t) => tags.includes(t))) continue;

      const enriched: NearbyEvent = {
        ...data,
        id: doc.id,
        distanceKm: Number(distKm.toFixed(2)),
        travelTime: estimateTravelTime(distKm),
      };
      seen.set(doc.id, enriched);
    }
  }

  const results = Array.from(seen.values())
    .sort((a, b) => {
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      const at = toMs(a.startTime);
      const bt = toMs(b.startTime);
      return at - bt;
    })
    .slice(0, limit);

  return NextResponse.json({
    ok: true,
    count: results.length,
    center: { lat, lng },
    radiusKm,
    events: results,
  });
  void haversineKm;
}

function toMs(v: unknown): number {
  if (v instanceof Date) return v.getTime();
  if (typeof v === "string") return new Date(v).getTime();
  if (typeof v === "object" && v && "seconds" in v) {
    return (v as { seconds: number }).seconds * 1000;
  }
  return 0;
}
