"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { eventsCol } from "@/lib/firebase/firestore";
import { AccentBar } from "@/components/shared/AccentBar";
import { H2, Label } from "@/components/shared/Typography";
import { EventCard } from "@/components/events/EventCard";
import type { SahayakEvent } from "@/types/event";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export function FeaturedEvents() {
  const [events, setEvents] = useState<SahayakEvent[]>([]);

  useEffect(() => {
    const q = query(eventsCol(), orderBy("startTime", "asc"), limit(3));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(
        snap.docs.map((d) => ({ ...(d.data() as SahayakEvent), id: d.id } as SahayakEvent)),
      );
    });
    return () => unsub();
    // Silence unused import warning for where in some builds
    void where;
  }, []);

  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="sahayak-container">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-6">
              <AccentBar width="sm" />
              <Label>Upcoming</Label>
            </div>
            <H2 className="mt-6">Where builders meet.</H2>
          </div>
          <Link href="/events" className="hidden md:block">
            <Button variant="secondary" size="sm" iconRight={<ArrowRight strokeWidth={1.5} className="h-4 w-4" />}>
              All Events
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {events.length > 0
            ? events.map((e) => <EventCard key={e.id} event={e} />)
            : Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 skeleton" aria-hidden="true" />
              ))}
        </div>
      </div>
    </section>
  );
}
