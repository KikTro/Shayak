import "server-only";
import axios from "axios";

const MAPS_SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_KEY;

export interface ReverseGeocodeResult {
  city: string;
  state: string;
  country: string;
  formattedAddress: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  if (!MAPS_SERVER_KEY) return null;
  try {
    const res = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: { latlng: `${lat},${lng}`, key: MAPS_SERVER_KEY },
      timeout: 8000,
    });
    const first = res.data?.results?.[0];
    if (!first) return null;
    const comps = first.address_components as Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    const find = (type: string) => comps.find((c) => c.types.includes(type))?.long_name ?? "";
    return {
      city: find("locality") || find("postal_town") || find("administrative_area_level_2"),
      state: find("administrative_area_level_1"),
      country: find("country"),
      formattedAddress: first.formatted_address as string,
    };
  } catch {
    return null;
  }
}

export async function forwardGeocode(query: string): Promise<{
  lat: number;
  lng: number;
  city: string;
  country: string;
} | null> {
  if (!MAPS_SERVER_KEY) return null;
  try {
    const res = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: { address: query, key: MAPS_SERVER_KEY },
      timeout: 8000,
    });
    const first = res.data?.results?.[0];
    if (!first) return null;
    const loc = first.geometry?.location;
    const comps = first.address_components as Array<{ long_name: string; types: string[] }>;
    return {
      lat: loc.lat,
      lng: loc.lng,
      city: comps.find((c) => c.types.includes("locality"))?.long_name ?? "",
      country: comps.find((c) => c.types.includes("country"))?.long_name ?? "",
    };
  } catch {
    return null;
  }
}
