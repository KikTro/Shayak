"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { subscribeRoomTyping } from "@/lib/firebase/realtime";
import { usersCol } from "@/lib/firebase/firestore";
import type { SahayakUser } from "@/types/user";

interface TypingIndicatorProps {
  roomId: string;
  currentUid: string | null;
}

export function TypingIndicator({ roomId, currentUid }: TypingIndicatorProps) {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    const unsub = subscribeRoomTyping(roomId, async (uids) => {
      const others = uids.filter((u) => u !== currentUid);
      if (!others.length) return setNames([]);
      const resolved = await Promise.all(
        others.slice(0, 5).map(async (u) => {
          try {
            const snap = await getDoc(doc(usersCol(), u));
            return (snap.data() as SahayakUser | undefined)?.displayName ?? "Someone";
          } catch {
            return "Someone";
          }
        }),
      );
      setNames(resolved);
    });
    return () => unsub();
  }, [roomId, currentUid]);

  if (!names.length) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are typing`
        : "Several people are typing";

  return (
    <div className="flex items-center gap-2 px-5 py-2 text-muted-foreground">
      <span className="font-sans text-xs italic">{label}</span>
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1 w-1 animate-pulse-dot bg-accent"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </div>
  );
}
