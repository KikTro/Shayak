"use client";

import { useMemo, useState } from "react";
import { useLocation } from "@/hooks/useLocation";
import { useNearbyEvents } from "@/hooks/useNearbyEvents";
import { AccentBar } from "@/components/shared/AccentBar";
import { H1, Label, Body } from "@/components/shared/Typography";
import { LocationPicker } from "@/components/events/LocationPicker";
import { EventFilters } from "@/components/events/EventFilters";
import { EventMap } from "@/components/events/EventMap";
import { EventCard } from "@/components/events/EventCard";

const DEFAULT_TAGS = ["Flutter", "AI", "Cloud", "Web", "Android", "Firebase", "ML"];

export default function EventsPage() {
  const { location } = useLocation();
  const [radius, setRadius] = useState(50);
  const [tags, setTags] = useState<string[]>([]);

  const center = useMemo(
    () => (location ? location.coordinates : { lat: 22.5726, lng: 88.3639 }), // Kolkata default
    [location],
  );

  const { events, loading } = useNearbyEvents({
    lat: center.lat,
    lng: center.lng,
    radiusKm: radius,
    tags,
  });

  return (
    <section className="py-12 md:py-20">
      <div className="sahayak-container">
        <div className="flex items-center gap-6">
          <AccentBar width="sm" />
          <Label>Discover</Label>
        </div>
        <H1 className="mt-6">Events near you.</H1>
        <Body className="mt-4 max-w-2xl text-muted-foreground">
          Live-synced from GDG community.dev and created by organizers like you.
          Sorted by distance, filtered by what you care about.
        </Body>

        <div className="mt-10 flex flex-col gap-4">
          <LocationPicker radiusKm={radius} onRadiusChange={setRadius} />
          <EventFilters tags={DEFAULT_TAGS} active={tags} onChange={setTags} />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-0 border border-border md:grid-cols-12">
          {/* List */}
          <div className="md:col-span-5 md:border-r md:border-border">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {loading ? "Loading…" : `${events.length} results`}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Sorted by distance
              </span>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {events.length === 0 && !loading ? (
                <div className="p-10 text-center font-sans text-sm text-muted-foreground">
                  No events found in this radius. Try widening to 100km, or check back soon —
                  Scout &amp; Catalyst work around the clock.
                </div>
              ) : null}
              <div className="flex flex-col">
                {events.map((e) => (
                  <div key={e.id} className="border-b border-border last:border-b-0">
                    <EventCard event={e} className="border-0" />
                  </div>
                ))}
                {loading && events.length === 0
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="skeleton h-32 border-b border-border" />
                    ))
                  : null}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="h-[400px] md:col-span-7 md:h-[70vh]">
            <EventMap center={center} events={events} />
          </div>
        </div>
      </div>
    </section>
  );
}
