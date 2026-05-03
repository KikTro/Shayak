"use client";

import { useEffect, useState } from "react";
import type { NearbyEvent } from "@/types/event";

interface Params {
  lat?: number | null;
  lng?: number | null;
  radiusKm?: number;
  tags?: string[];
  limit?: number;
}

export function useNearbyEvents({ lat, lng, radiusKm = 50, tags = [], limit = 30 }: Params) {
  const [events, setEvents] = useState<NearbyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lng) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const url = new URL("/api/events/nearby", window.location.origin);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lng", String(lng));
    url.searchParams.set("radiusKm", String(radiusKm));
    url.searchParams.set("limit", String(limit));
    if (tags.length) url.searchParams.set("tags", tags.join(","));

    fetch(url.toString())
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { events: NearbyEvent[] };
        if (!cancelled) setEvents(data.events ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng, radiusKm, tags.join(","), limit]);

  return { events, loading, error };
}
