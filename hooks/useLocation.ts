"use client";

import { useCallback, useEffect, useState } from "react";

export interface UserLocation {
  coordinates: { lat: number; lng: number };
  city: string;
  state: string;
  country: string;
  source: "gps" | "ip" | "manual";
}

const STORAGE_KEY = "sahayak:location";

export function useLocation() {
  const [location, setLocationState] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((loc: UserLocation | null) => {
    setLocationState(loc);
    if (typeof window === "undefined") return;
    if (loc) localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const requestGps = useCallback(async (): Promise<UserLocation | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return null;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const loc: UserLocation = {
            coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            city: "",
            state: "",
            country: "",
            source: "gps",
          };
          try {
            const res = await fetch(
              `/api/geocode/reverse?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`,
            );
            if (res.ok) {
              const data = (await res.json()) as Partial<UserLocation>;
              Object.assign(loc, data, { source: "gps" });
            }
          } catch {
            /* ignore */
          }
          persist(loc);
          resolve(loc);
        },
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 },
      );
    });
  }, [persist]);

  const requestIp = useCallback(async (): Promise<UserLocation | null> => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) return null;
      const data = (await res.json()) as {
        latitude?: number;
        longitude?: number;
        city?: string;
        region?: string;
        country_name?: string;
      };
      if (!data.latitude || !data.longitude) return null;
      const loc: UserLocation = {
        coordinates: { lat: data.latitude, lng: data.longitude },
        city: data.city ?? "",
        state: data.region ?? "",
        country: data.country_name ?? "",
        source: "ip",
      };
      persist(loc);
      return loc;
    } catch {
      return null;
    }
  }, [persist]);

  const setManual = useCallback(
    (loc: Omit<UserLocation, "source"> | null) => {
      persist(loc ? { ...loc, source: "manual" } : null);
    },
    [persist],
  );

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (typeof window === "undefined") return;
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as UserLocation;
          if (!cancelled) setLocationState(parsed);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      const gps = await requestGps();
      if (!gps && !cancelled) {
        const ip = await requestIp();
        if (!ip && !cancelled) setError("Unable to determine location");
      }
      if (!cancelled) setLoading(false);
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [requestGps, requestIp]);

  return { location, loading, error, requestGps, requestIp, setManual };
}
