"use client";

import {
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  set,
  update,
  type DataSnapshot,
} from "firebase/database";
import { getFirebaseRtdb } from "./config";

export interface PresenceData {
  online: boolean;
  lastSeen: number;
  typing?: Record<string, boolean>;
}

/** Attach presence tracking: marks user online and clears on disconnect. */
export function attachPresence(uid: string): () => void {
  const db = getFirebaseRtdb();
  const userRef = ref(db, `presence/${uid}`);
  const connectedRef = ref(db, ".info/connected");

  const unsub = onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      onDisconnect(userRef)
        .set({ online: false, lastSeen: serverTimestamp() })
        .then(() => {
          set(userRef, { online: true, lastSeen: serverTimestamp() });
        })
        .catch(() => {
          /* noop */
        });
    }
  });

  return () => unsub();
}

export function setTyping(uid: string, roomId: string, typing: boolean): void {
  const db = getFirebaseRtdb();
  const typingRef = ref(db, `presence/${uid}/typing/${roomId}`);
  if (typing) {
    set(typingRef, true).catch(() => {});
    // Auto-clear after 5s of inactivity (caller also clears)
    setTimeout(() => set(typingRef, null).catch(() => {}), 5000);
  } else {
    set(typingRef, null).catch(() => {});
  }
}

export function subscribePresence(
  uid: string,
  cb: (data: PresenceData | null) => void,
): () => void {
  const db = getFirebaseRtdb();
  const userRef = ref(db, `presence/${uid}`);
  const unsub = onValue(userRef, (snap: DataSnapshot) => {
    cb((snap.val() as PresenceData | null) ?? null);
  });
  return () => unsub();
}

export function subscribeRoomTyping(
  roomId: string,
  cb: (typingUids: string[]) => void,
): () => void {
  const db = getFirebaseRtdb();
  const presenceRef = ref(db, `presence`);
  const unsub = onValue(presenceRef, (snap) => {
    const val = snap.val() as Record<string, PresenceData> | null;
    if (!val) return cb([]);
    const typing = Object.entries(val)
      .filter(([, p]) => p?.typing?.[roomId])
      .map(([uid]) => uid);
    cb(typing);
  });
  return () => unsub();
}

export function updateLastSeen(uid: string): void {
  const db = getFirebaseRtdb();
  update(ref(db, `presence/${uid}`), { lastSeen: serverTimestamp() }).catch(() => {});
}
