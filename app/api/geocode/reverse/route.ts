import { NextResponse, type NextRequest } from "next/server";
import { reverseGeocode } from "@/lib/maps/geocoding";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "invalid coords" }, { status: 400 });
  }
  const result = await reverseGeocode(lat, lng);
  if (!result) return NextResponse.json({ city: "", state: "", country: "" });
  return NextResponse.json(result);
}
