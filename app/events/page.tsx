"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ExternalLink, MapPin, Sparkles, Tag } from "lucide-react";
import { AccentBar } from "@/components/shared/AccentBar";
import { H1, Label, Body } from "@/components/shared/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";

interface SearchEvent {
  title: string;
  description: string;
  organizer: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  startDate: string;
  endDate?: string;
  tags: string[];
  sourceUrl?: string;
  type?: string;
}

const SUGGESTED_INTERESTS = [
  "Flutter",
  "AI",
  "Cloud",
  "Web",
  "Android",
  "Firebase",
  "ML",
  "DevOps",
  "Blockchain",
  "Cybersecurity",
];

export default function EventsPage() {
  const { profile, loading: authLoading } = useAuth();

  const [city, setCity] = useState("");
  const [stateField, setStateField] = useState("");
  const [country, setCountry] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const [events, setEvents] = useState<SearchEvent[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setCity(profile.location?.city ?? "");
    setStateField(profile.location?.state ?? "");
    setCountry(profile.location?.country ?? "");
    setInterests(profile.interests ?? profile.skills ?? []);
  }, [profile]);

  function toggleInterest(t: string) {
    setInterests((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!city || !country) {
      setError("Please enter at least a city and country.");
      return;
    }
    setSearching(true);
    setError(null);
    setHasSearched(true);
    try {
      const res = await fetch("/api/claude/search-events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          city,
          state: stateField,
          country,
          interests,
          limit: 15,
        }),
      });
      const data = (await res.json()) as { events?: SearchEvent[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setEvents(data.events ?? []);
    } catch (err) {
      setError((err as Error).message);
      setEvents([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <section className="py-12 md:py-20">
      <div className="sahayak-container">
        <div className="flex items-center gap-6">
          <AccentBar width="sm" />
          <Label>Discover</Label>
        </div>
        <H1 className="mt-6">Events near you.</H1>
        <Body className="mt-4 max-w-2xl text-muted-foreground">
          Tell us where you are and what you care about. We search the
          open web — GDGs, meetups, conferences, hackathons — and return what&rsquo;s
          worth your time.
        </Body>

        <form
          onSubmit={handleSearch}
          className="mt-10 border border-border p-6 flex flex-col gap-5"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="City"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Kolkata"
            />
            <Input
              label="State / Region"
              value={stateField}
              onChange={(e) => setStateField(e.target.value)}
              placeholder="West Bengal"
            />
            <Input
              label="Country"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="India"
            />
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Interests
            </span>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set([...SUGGESTED_INTERESTS, ...interests])).map((t) => {
                const active = interests.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleInterest(t)}
                    className={`border px-3 py-1 font-mono text-xs uppercase tracking-widest transition-colors ${
                      active
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" variant="accent" loading={searching}>
              <Sparkles className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Search
            </Button>
            {!authLoading && !profile ? (
              <Link
                href="/onboarding"
                className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Save a profile to skip this next time →
              </Link>
            ) : null}
          </div>

          {error ? <p className="font-mono text-xs text-danger">{error}</p> : null}
        </form>

        <div className="mt-10 border border-border">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {searching
                ? "Searching near you…"
                : hasSearched
                ? `${events.length} result${events.length === 1 ? "" : "s"}`
                : "Run a search to see events"}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {city && country ? `${city}, ${country}` : ""}
            </span>
          </div>

          {searching ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-6">
                  <div className="skeleton h-6 w-2/3" />
                  <div className="skeleton mt-3 h-4 w-full" />
                  <div className="skeleton mt-2 h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : events.length === 0 && hasSearched ? (
            <div className="p-10 text-center font-sans text-sm text-muted-foreground">
              No events surfaced. Try broadening your interests or a nearby larger city.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {events.map((ev, idx) => (
                <li key={`${ev.title}-${idx}`} className="p-6 transition-colors hover:bg-input/40">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-sans text-xl leading-snug tracking-tight text-foreground md:text-2xl">
                      {ev.title}
                    </h3>
                    {ev.type ? <Badge variant="outline">{ev.type}</Badge> : null}
                  </div>

                  {ev.description ? (
                    <p className="mt-2 font-sans text-sm text-muted-foreground">{ev.description}</p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
                    {ev.startDate ? (
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {ev.startDate}
                        {ev.endDate ? ` → ${ev.endDate}` : ""}
                      </span>
                    ) : null}
                    {ev.venue || ev.city ? (
                      <span className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {[ev.venue, ev.city, ev.country].filter(Boolean).join(" · ")}
                      </span>
                    ) : null}
                    {ev.organizer ? (
                      <span className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {ev.organizer}
                      </span>
                    ) : null}
                  </div>

                  {ev.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ev.tags.slice(0, 6).map((t) => (
                        <Badge key={t} variant="outline">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  {ev.sourceUrl ? (
                    <a
                      href={ev.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-accent hover:underline"
                    >
                      Open source
                      <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
