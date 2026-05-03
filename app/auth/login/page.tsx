"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AccentBar } from "@/components/shared/AccentBar";
import { H1, Label, Body } from "@/components/shared/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push("/onboarding");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      router.push("/onboarding");
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
            <Label>Sign In</Label>
          </div>
          <H1 className="mt-6">Welcome back.</H1>
          <Body className="mt-6 text-muted-foreground">
            Enter the community that Kiran built. Keep building what he started.
          </Body>
        </div>

        <div className="md:col-span-7">
          <div className="max-w-md">
            <Button variant="secondary" onClick={handleGoogle} loading={loading} className="w-full">
              Continue with Google
            </Button>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleEmail} className="flex flex-col gap-5">
              <Input
                label="Email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error ? (
                <p className="font-mono text-xs text-danger">{error}</p>
              ) : null}
              <Button type="submit" variant="accent" loading={loading}>
                Sign In
              </Button>
            </form>

            <p className="mt-8 font-sans text-sm text-muted-foreground">
              Don&rsquo;t have an account?{" "}
              <Link href="/auth/register" className="link-underline text-foreground">
                Register →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
