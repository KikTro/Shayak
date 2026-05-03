"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { introRequestsCol, usersCol } from "@/lib/firebase/firestore";
import type { IntroRequest } from "@/types/agent";
import type { SahayakUser } from "@/types/user";

interface Props {
  uid: string;
}

interface Hydrated extends IntroRequest {
  other?: SahayakUser;
}

export function MatchSuggestion({ uid }: Props) {
  const [items, setItems] = useState<Hydrated[]>([]);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      introRequestsCol(),
      where("fromUid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(5),
    );
    const unsub = onSnapshot(q, async (snap) => {
      const raw = snap.docs.map((d) => ({ ...(d.data() as IntroRequest), id: d.id }));
      const hydrated = await Promise.all(
        raw.map(async (r) => {
          const otherSnap = await getDoc(doc(usersCol(), r.toUid));
          return {
            ...r,
            other: otherSnap.exists() ? (otherSnap.data() as SahayakUser) : undefined,
          } as Hydrated;
        }),
      );
      setItems(hydrated);
    });
    return () => unsub();
  }, [uid]);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {items.map((r) => (
        <div key={r.id} className="border border-border p-5">
          <div className="flex items-center justify-between">
            <Link
              href={`/profile/${r.toUid}`}
              className="link-underline font-sans text-lg text-foreground"
            >
              {r.other?.displayName ?? r.toUid}
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {r.status}
            </span>
          </div>
          <p className="mt-3 font-sans text-sm text-muted-foreground">{r.matchReason}</p>
        </div>
      ))}
    </div>
  );
}
