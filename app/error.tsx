"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AccentBar } from "@/components/shared/AccentBar";
import { H1, Body, Label } from "@/components/shared/Typography";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="py-40">
      <div className="sahayak-container">
        <div className="flex items-center gap-6">
          <AccentBar width="sm" />
          <Label>Error</Label>
        </div>
        <H1 className="mt-6">Something broke.</H1>
        <Body className="mt-6 max-w-xl text-muted-foreground">
          We logged it and the agents will learn. Try again, or head back home.
        </Body>
        <div className="mt-10 flex gap-4">
          <Button variant="secondary" onClick={reset}>
            Try again
          </Button>
          <Link href="/">
            <Button variant="ghost">Return home</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
