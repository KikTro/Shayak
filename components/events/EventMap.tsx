"use client";

import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useRef } from "react";
import type { NearbyEvent } from "@/types/event";

interface EventMapProps {
  center: { lat: number; lng: number };
  events: NearbyEvent[];
  onSelect?: (id: string) => void;
}

const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0A0A0A" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#737373" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0A0A0A" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#262626" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1A1A1A" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#262626" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#111111" }] },
];

export function EventMap({ center, events, onSelect }: EventMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key || !containerRef.current) return;

    const loader = new Loader({ apiKey: key, version: "weekly", libraries: ["places"] });
    let cancelled = false;

    loader.load().then(() => {
      if (cancelled || !containerRef.current) return;
      mapRef.current = new google.maps.Map(containerRef.current, {
        center,
        zoom: 11,
        styles: DARK_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        backgroundColor: "#0A0A0A",
      });

      // User dot
      new google.maps.Marker({
        position: center,
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#FAFAFA",
          fillOpacity: 1,
          strokeColor: "#FAFAFA",
          strokeWeight: 2,
        },
        title: "You",
      });
    });

    return () => {
      cancelled = true;
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    for (const evt of events) {
      const coords = evt.location?.coordinates as { latitude: number; longitude: number } | undefined;
      if (!coords?.latitude) continue;
      const marker = new google.maps.Marker({
        position: { lat: coords.latitude, lng: coords.longitude },
        map: mapRef.current,
        icon: {
          path: "M 0,-10 L 6,4 L -6,4 Z",
          fillColor: "#FF3D00",
          fillOpacity: 1,
          strokeColor: "#FF3D00",
          strokeWeight: 0,
          scale: 1,
        },
        title: evt.title,
      });

      const info = new google.maps.InfoWindow({
        content: `<div style="color:#FAFAFA;font-family:Inter Tight,sans-serif;padding:4px 2px;max-width:240px">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:#FF3D00">
            ${evt.distanceKm.toFixed(1)} km away
          </div>
          <div style="font-size:15px;margin-top:6px;color:#FAFAFA">${escapeHtml(evt.title)}</div>
          <a href="/events/${evt.id}" style="font-size:12px;color:#FAFAFA;text-decoration:underline;margin-top:8px;display:inline-block">View Details →</a>
        </div>`,
      });

      marker.addListener("click", () => {
        info.open({ map: mapRef.current!, anchor: marker });
        onSelect?.(evt.id);
      });

      markersRef.current.push(marker);
    }
  }, [events, onSelect]);

  return <div ref={containerRef} className="h-full w-full bg-muted" />;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[c] ?? c;
  });
}
