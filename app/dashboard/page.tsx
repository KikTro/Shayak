"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { useNearbyEvents } from "@/hooks/useNearbyEvents";
import { AccentBar } from "@/components/shared/AccentBar";
import { H1, H3, Label, Body } from "@/components/shared/Typography";
import { EventCard } from "@/components/events/EventCard";
import { AgentLog } from "@/components/agent/AgentLog";
import { MatchSuggestion } from "@/components/community/MatchSuggestion";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { firebaseUser, profile, loading } = useAuth();
  const router = useRouter();
  const { location } = useLocation();
  const { events } = useNearbyEvents({
    lat: location?.coordinates.lat ?? 22.5726,
    lng: location?.coordinates.lng ?? 88.3639,
    radiusKm: 50,
    limit: 6,
  });

  useEffect(() => {
    if (!loading && !firebaseUser) router.push("/auth/login");
  }, [loading, firebaseUser, router]);

  if (loading || !firebaseUser) return null;

  return (
    <section className="py-12 md:py-20">
      <div className="sahayak-container">
        <div className="flex items-center gap-6">
          <AccentBar width="sm" />
          <Label>Welcome back</Label>
        </div>
        <H1 className="mt-6">Hello, {profile?.displayName ?? "builder"}.</H1>
        <Body className="mt-4 max-w-2xl text-muted-foreground">
          Here&rsquo;s what&rsquo;s happening in your community right now.
        </Body>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-4">
                <AccentBar width="sm" />
                <Label>Events near you</Label>
              </div>
              <Link href="/events">
                <Button
                  variant="ghost"
                  size="sm"
                  iconRight={<ArrowRight className="h-4 w-4" strokeWidth={1.5} />}
                >
                  See all
                </Button>
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {events.slice(0, 4).map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
              {events.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-48 border border-border" />
                  ))
                : null}
            </div>

            <div className="mt-12">
              <div className="flex items-center gap-4">
                <AccentBar width="sm" />
                <Label>Suggested connections</Label>
              </div>
              <div className="mt-6">
                <MatchSuggestion uid={firebaseUser.uid} />
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <H3 as="div" className="flex items-center gap-4">
              <AccentBar width="sm" />
              <Label>Agent Feed</Label>
            </H3>
            <div className="mt-6">
              <AgentLog />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
