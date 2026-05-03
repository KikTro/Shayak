"use client";

import { useEffect, useMemo, useState } from "react";
import { limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { usersCol } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { AccentBar } from "@/components/shared/AccentBar";
import { H1, Label, Body } from "@/components/shared/Typography";
import { Input } from "@/components/ui/Input";
import { DeveloperCard } from "@/components/community/DeveloperCard";
import { MatchSuggestion } from "@/components/community/MatchSuggestion";
import { SkillGraph } from "@/components/community/SkillGraph";
import type { SahayakUser } from "@/types/user";

export default function CommunityPage() {
  const { firebaseUser } = useAuth();
  const [devs, setDevs] = useState<SahayakUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(usersCol(), orderBy("lastActiveAt", "desc"), limit(60));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setDevs(
          snap.docs.map((d) => ({ ...(d.data() as SahayakUser), uid: d.id } as SahayakUser)),
        );
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return devs;
    return devs.filter(
      (u) =>
        u.displayName.toLowerCase().includes(s) ||
        u.skills?.some((k) => k.toLowerCase().includes(s)) ||
        u.location?.city?.toLowerCase().includes(s),
    );
  }, [devs, search]);

  const topSkills = useMemo(() => {
    const counts = new Map<string, number>();
    devs.forEach((d) => d.skills?.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1)));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, count }));
  }, [devs]);

  const connectionsMade = devs.filter((d) => d.agentDiscovered).length;

  return (
    <section className="py-12 md:py-20">
      <div className="sahayak-container">
        <div className="flex items-center gap-6">
          <AccentBar width="sm" />
          <Label>Community</Label>
        </div>
        <H1 className="mt-6">Find your people.</H1>
        <Body className="mt-4 max-w-2xl text-muted-foreground">
          Every builder here has something to teach. Many were found by Scout.
          A few intros were made in Kiran&rsquo;s memory —{" "}
          <span className="text-accent">{connectionsMade} connections</span> and counting.
        </Body>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Input
              placeholder="Search by name, skill, or city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              label="Search"
            />

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading && filtered.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton h-64 border border-border" />
                  ))
                : null}
              {filtered.map((u) => (
                <DeveloperCard key={u.uid} user={u} />
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-10 lg:col-span-4">
            <div>
              <div className="flex items-center gap-4">
                <AccentBar width="sm" />
                <Label>Top Skills</Label>
              </div>
              <div className="mt-6">
                <SkillGraph skills={topSkills} />
              </div>
            </div>

            {firebaseUser ? (
              <div>
                <div className="flex items-center gap-4">
                  <AccentBar width="sm" />
                  <Label>Suggested Connections</Label>
                </div>
                <div className="mt-6">
                  <MatchSuggestion uid={firebaseUser.uid} />
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}
