"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { introRequestsCol, usersCol } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { AccentBar } from "@/components/shared/AccentBar";
import { Label } from "@/components/shared/Typography";
import type { IntroRequest } from "@/types/agent";
import type { SahayakUser } from "@/types/user";

interface Resolved extends IntroRequest {
  fromUser?: Pick<SahayakUser, "displayName" | "photoURL">;
  toUser?: Pick<SahayakUser, "displayName" | "photoURL">;
}

export function IntroApproval() {
  const { firebaseUser } = useAuth();
  const [items, setItems] = useState<Resolved[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      introRequestsCol(),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
      limit(20),
    );
    const unsub = onSnapshot(q, async (snap) => {
      const raw = snap.docs.map((d) => ({ ...(d.data() as IntroRequest), id: d.id }));
      const resolved = await Promise.all(
        raw.map(async (r) => {
          const [a, b] = await Promise.all([
            getDoc(doc(usersCol(), r.fromUid)),
            getDoc(doc(usersCol(), r.toUid)),
          ]);
          return {
            ...r,
            fromUser: a.exists() ? (a.data() as SahayakUser) : undefined,
            toUser: b.exists() ? (b.data() as SahayakUser) : undefined,
          } as Resolved;
        }),
      );
      setItems(resolved);
    });
    return () => unsub();
  }, []);

  async function act(requestId: string, action: "approve" | "reject") {
    if (!firebaseUser) return;
    setBusy(requestId);
    try {
      const token = await firebaseUser.getIdToken();
      await fetch("/api/agents/matchmaker", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, requestId }),
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section>
      <div className="flex items-center gap-6">
        <AccentBar width="sm" />
        <Label>Pending Introductions</Label>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {items.length === 0 ? (
          <div className="border border-border p-10 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
            No pending introductions. Matchmaker is thinking…
          </div>
        ) : null}

        {items.map((r) => (
          <div key={r.id} className="border border-border p-6">
            <div className="flex items-center gap-3 font-sans text-lg text-foreground">
              <span>{r.fromUser?.displayName ?? r.fromUid}</span>
              <span className="text-muted-foreground">↔</span>
              <span>{r.toUser?.displayName ?? r.toUid}</span>
              {typeof r.confidenceScore === "number" ? (
                <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  confidence {Math.round(r.confidenceScore * 100)}%
                </span>
              ) : null}
            </div>

            <p className="mt-4 border-l-2 border-accent pl-4 font-sans text-sm text-muted-foreground">
              {r.matchReason}
            </p>

            <div className="mt-4 border border-border bg-muted p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Draft message
              </div>
              <p className="mt-2 font-sans text-sm text-foreground">{r.draftMessage}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-4">
              <Button
                variant="accent"
                size="sm"
                onClick={() => act(r.id, "approve")}
                loading={busy === r.id}
              >
                Approve &amp; Send
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => act(r.id, "reject")}
                loading={busy === r.id}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
