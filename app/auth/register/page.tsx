"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AccentBar } from "@/components/shared/AccentBar";
import { H1, Label, Body } from "@/components/shared/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerWithEmail, signInWithGoogle } from "@/lib/firebase/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    city: "",
    skills: "",
    github: "",
    twitter: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function upd<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerWithEmail({
        displayName: form.displayName,
        email: form.email,
        password: form.password,
        city: form.city,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        github: form.github,
        twitter: form.twitter,
      });
      // Fire-and-forget Scout enrichment
      fetch("/api/agents/scout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "enrich-self", city: form.city }),
      }).catch(() => {});
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 md:py-28">
      <div className="sahayak-container grid grid-cols-1 gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-6">
            <AccentBar width="sm" />
            <Label>Register</Label>
          </div>
          <H1 className="mt-6">Join the community.</H1>
          <Body className="mt-6 text-muted-foreground">
            Tell us a bit about you. Scout Agent will enrich your profile from
            your public work so you show up for the right events and people.
          </Body>
        </div>

        <div className="md:col-span-7">
          <div className="max-w-lg">
            <Button
              variant="secondary"
              onClick={async () => {
                setLoading(true);
                try {
                  await signInWithGoogle();
                  router.push("/dashboard");
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
              className="w-full"
            >
              Continue with Google
            </Button>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                or register with email
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Display Name"
                value={form.displayName}
                onChange={(e) => upd("displayName", e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => upd("email", e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => upd("password", e.target.value)}
                required
                minLength={8}
              />
              <Input
                label="City"
                placeholder="Kolkata"
                value={form.city}
                onChange={(e) => upd("city", e.target.value)}
              />
              <Input
                label="Skills (comma separated)"
                placeholder="Flutter, Firebase, Next.js"
                value={form.skills}
                onChange={(e) => upd("skills", e.target.value)}
              />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input
                  label="GitHub"
                  placeholder="username"
                  value={form.github}
                  onChange={(e) => upd("github", e.target.value)}
                />
                <Input
                  label="Twitter / X"
                  placeholder="@handle"
                  value={form.twitter}
                  onChange={(e) => upd("twitter", e.target.value)}
                />
              </div>
              {error ? <p className="font-mono text-xs text-danger">{error}</p> : null}
              <Button type="submit" variant="accent" loading={loading}>
                Create Account
              </Button>
            </form>

            <p className="mt-8 font-sans text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="link-underline text-foreground">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
