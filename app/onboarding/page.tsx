"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { AccentBar } from "@/components/shared/AccentBar";
import { H1, Label, Body } from "@/components/shared/Typography";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { getFirebaseDb } from "@/lib/firebase/config";

const SUGGESTED_INTERESTS = [
  "Flutter",
  "AI",
  "Cloud",
  "Web",
  "Android",
  "iOS",
  "Firebase",
  "ML",
  "DevOps",
  "Cybersecurity",
  "Blockchain",
  "AR/VR",
  "Game Dev",
  "Data Science",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { firebaseUser, profile, loading } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [state, setStateField] = useState("");
  const [country, setCountry] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [github, setGithub] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Not signed in → bounce to login
  useEffect(() => {
    if (!loading && !firebaseUser) router.replace("/auth/login");
  }, [loading, firebaseUser, router]);

  // Pre-fill from existing profile if any
  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName ?? "");
    setBio(profile.bio ?? "");
    setCity(profile.location?.city ?? "");
    setStateField(profile.location?.state ?? "");
    setCountry(profile.location?.country ?? "");
    setInterests(profile.interests ?? profile.skills ?? []);
    setGithub(profile.socialLinks?.github ?? "");
    setTwitter(profile.socialLinks?.twitter ?? "");
    setWebsite(profile.socialLinks?.website ?? "");
  }, [profile]);

  function toggleInterest(tag: string) {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function addCustomInterest() {
    const t = customInterest.trim();
    if (!t) return;
    if (!interests.includes(t)) setInterests((prev) => [...prev, t]);
    setCustomInterest("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseUser) return;
    setSaving(true);
    setError(null);
    try {
      const db = getFirebaseDb();
      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          displayName: displayName || firebaseUser.displayName || "Builder",
          bio,
          location: {
            city,
            state,
            country,
            coordinates: { latitude: 0, longitude: 0 },
          },
          interests,
          skills: interests, // keep parity for legacy queries
          socialLinks: {
            github: github || undefined,
            twitter: twitter || undefined,
            website: website || undefined,
          },
          lastActiveAt: serverTimestamp(),
        },
        { merge: true },
      );
      router.push("/events");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="py-20">
        <div className="sahayak-container">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton mt-6 h-64 w-full max-w-xl" />
        </div>
      </section>
    );
  }

  const canSubmit = !!city && !!country && interests.length > 0 && !!displayName;

  return (
    <section className="py-16 md:py-24">
      <div className="sahayak-container grid grid-cols-1 gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-6">
            <AccentBar width="sm" />
            <Label>Step 01 — Profile</Label>
          </div>
          <H1 className="mt-6">Tell us where you build.</H1>
          <Body className="mt-6 text-muted-foreground">
            Your city, country, and interests are what Sahayak uses to surface
            events, people, and collaborations worth your time. Nothing is public
            until you say so.
          </Body>
        </div>

        <form onSubmit={handleSubmit} className="md:col-span-7 flex max-w-xl flex-col gap-6">
          <Input
            label="Display Name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should the community know you?"
          />

          <Textarea
            label="Short Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="One line on what you're building or curious about."
          />

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
              value={state}
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
              Interests (pick a few)
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_INTERESTS.map((t) => {
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

            <div className="flex gap-2">
              <Input
                placeholder="Add your own (e.g. Rust, Robotics)"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomInterest();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addCustomInterest}>
                Add
              </Button>
            </div>

            {interests.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {interests.map((t) => (
                  <Badge key={t} variant="accent">
                    {t}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="GitHub"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="username"
            />
            <Input
              label="Twitter / X"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@handle"
            />
          </div>
          <Input
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://…"
          />

          {error ? <p className="font-mono text-xs text-danger">{error}</p> : null}

          <div className="flex items-center gap-4">
            <Button type="submit" variant="accent" loading={saving} disabled={!canSubmit}>
              Save &amp; find events →
            </Button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
